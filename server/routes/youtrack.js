function sendProxyError(res, error) {
  res.status(500).json({
    error: error.message,
    timestamp: new Date().toISOString()
  });
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
      const data = await makeYouTrackRequest('/api/issues', 'POST', req.body);
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
      if (data && data.length > 0 && data[0].bundle && data[0].bundle.values) {
        res.json(data[0].bundle.values);
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

        const tags = await makeYouTrackRequest(`/api/tags?fields=id,name&query=${encodeURIComponent(name)}`);
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
