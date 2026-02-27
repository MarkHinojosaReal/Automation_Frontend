function sendProxyError(res, error) {
  res.status(500).json({
    error: error.message,
    timestamp: new Date().toISOString()
  });
}

function isRetryableUserError(error) {
  return error.statusCode >= 400 && error.statusCode < 500;
}

async function createIssueWithFallback(payload, makeYouTrackRequest) {
  const requestorField = (payload.customFields || []).find(
    f => f.name === 'Requestor' && f.$type === 'SingleUserIssueCustomField'
  );

  if (!requestorField || !requestorField.value || !requestorField.value.login) {
    return makeYouTrackRequest('/api/issues', 'POST', payload);
  }

  const originalLogin = requestorField.value.login;
  const hasAtSign = originalLogin.includes('@');
  const emailPrefix = hasAtSign ? originalLogin.split('@')[0] : originalLogin;

  // Tier 1: try the payload as-is (email prefix as login)
  try {
    console.log(`📋 Tier 1: Creating issue with Requestor login "${originalLogin}"`);
    return await makeYouTrackRequest('/api/issues', 'POST', payload);
  } catch (tier1Error) {
    if (!isRetryableUserError(tier1Error)) throw tier1Error;
    console.warn(`⚠️ Tier 1 failed (${tier1Error.statusCode}): Requestor "${originalLogin}" not found in YouTrack`);
  }

  // Tier 2: try the alternative login format
  const alternativeLogin = hasAtSign ? emailPrefix : `${originalLogin}@therealbrokerage.com`;
  const tier2Payload = structuredClone(payload);
  const tier2Requestor = tier2Payload.customFields.find(
    f => f.name === 'Requestor' && f.$type === 'SingleUserIssueCustomField'
  );
  tier2Requestor.value = { login: alternativeLogin };

  try {
    console.log(`📋 Tier 2: Retrying with alternative login "${alternativeLogin}"`);
    return await makeYouTrackRequest('/api/issues', 'POST', tier2Payload);
  } catch (tier2Error) {
    if (!isRetryableUserError(tier2Error)) throw tier2Error;
    console.warn(`⚠️ Tier 2 failed (${tier2Error.statusCode}): Requestor "${alternativeLogin}" also not found`);
  }

  // Tier 3: strip Requestor, embed email in description
  const tier3Payload = structuredClone(payload);
  tier3Payload.customFields = tier3Payload.customFields.filter(
    f => !(f.name === 'Requestor' && f.$type === 'SingleUserIssueCustomField')
  );

  const requestorEmail = hasAtSign ? originalLogin : `${originalLogin}@therealbrokerage.com`;
  tier3Payload.description = (tier3Payload.description || '') + `\n\n**Requested by:** ${requestorEmail}`;

  console.log(`📋 Tier 3: Creating issue without Requestor field, email embedded in description`);
  return await makeYouTrackRequest('/api/issues', 'POST', tier3Payload);
}

function registerYouTrackRoutes(app, makeYouTrackRequest, options = {}) {
  const { includeTagRoute = false } = options;

  app.get('/api/youtrack/current-sprint', async (req, res) => {
    try {
      const agileId = req.query.agileId || '124-333';
      const fields = req.query.fields || 'idReadable,summary,customFields[4](value(name))';
      const endpoint = `/api/agiles/${agileId}/sprints/current/issues?fields=${fields}`;

      const data = await makeYouTrackRequest(endpoint);
      res.json(data);
    } catch (error) {
      sendProxyError(res, error);
    }
  });

  app.get('/api/youtrack/issues', async (req, res) => {
    try {
      const fields = req.query.fields || 'idReadable,summary,description,created,updated';
      const top = req.query.top || '100';
      const query = req.query.query;

      let endpoint = `/api/issues?fields=${fields}&$top=${top}`;
      if (query) {
        endpoint += `&query=${encodeURIComponent(query)}`;
      }

      const data = await makeYouTrackRequest(endpoint);
      res.json(data);
    } catch (error) {
      sendProxyError(res, error);
    }
  });

  app.post('/api/youtrack/issues', async (req, res) => {
    try {
      const data = await createIssueWithFallback(req.body, makeYouTrackRequest);
      res.json(data);
    } catch (error) {
      sendProxyError(res, error);
    }
  });

  app.get('/api/youtrack/issues/:issueId', async (req, res) => {
    try {
      const { issueId } = req.params;
      const fields = req.query.fields || 'idReadable,summary,description,created,updated';
      const endpoint = `/api/issues/${issueId}?fields=${fields}`;

      const data = await makeYouTrackRequest(endpoint);
      res.json(data);
    } catch (error) {
      sendProxyError(res, error);
    }
  });

  app.get('/api/youtrack/projects/:projectId/custom-fields/:fieldName', async (req, res) => {
    try {
      const { projectId, fieldName } = req.params;
      const endpoint = `/api/admin/projects/${projectId}/customFields?fields=field(fieldType(valueType),name),bundle(values(name))&query=${encodeURIComponent(`field: {${fieldName}}`)}`;

      const data = await makeYouTrackRequest(endpoint);
      const match = Array.isArray(data) ? data.find(f => f.field && f.field.name === fieldName) : null;
      if (match && match.bundle && match.bundle.values) {
        res.json(match.bundle.values);
      } else {
        res.json([]);
      }
    } catch (error) {
      sendProxyError(res, error);
    }
  });

  if (includeTagRoute) {
    app.post('/api/youtrack/issues/:issueId/tags', async (req, res) => {
      try {
        const { issueId } = req.params;
        const { name } = req.body;

        // Fetch all visible tags and filter client-side; the query= param causes 400 on some YouTrack instances
        const tags = await makeYouTrackRequest(`/api/tags?fields=id,name&$top=200`);
        const tag = Array.isArray(tags) ? tags.find((item) => item.name === name) : null;

        if (!tag) {
          return res.status(404).json({ error: `Tag '${name}' not found` });
        }

        const data = await makeYouTrackRequest(`/api/issues/${issueId}/tags`, 'POST', { id: tag.id });
        res.json(data);
      } catch (error) {
        sendProxyError(res, error);
      }
    });
  }

  app.all('/api/youtrack/*', async (req, res) => {
    try {
      const ytPath = req.path.replace('/api/youtrack', '/api');
      const queryString = new URLSearchParams(req.query).toString();
      const endpoint = queryString ? `${ytPath}?${queryString}` : ytPath;

      const data = await makeYouTrackRequest(endpoint, req.method, req.body);
      res.json(data);
    } catch (error) {
      sendProxyError(res, error);
    }
  });
}

module.exports = {
  registerYouTrackRoutes
};
