const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// YouTrack configuration
const YOUTRACK_BASE_URL = 'https://realbrokerage.youtrack.cloud';
const YOUTRACK_TOKEN = 'perm-bWFyay5oaW5vam9zYQ==.NTktMTU4.0k4Ad1tAdROERwu5cBfYRMdUcDS6T3';

// Helper function to make requests to YouTrack
async function makeYouTrackRequest(endpoint) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const url = `${YOUTRACK_BASE_URL}${endpoint}`;
    console.log(`🚀 Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YOUTRACK_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ YouTrack API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`YouTrack API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${Array.isArray(data) ? data.length : 'data'} items`);
    return data;
  } catch (error) {
    console.error('❌ Proxy request failed:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YouTrack proxy server is running' });
});

// Proxy endpoint for current sprint issues
app.get('/api/youtrack/current-sprint', async (req, res) => {
  try {
    const agileId = req.query.agileId || '124-333';
    const fields = req.query.fields || 'idReadable,summary,customFields[4](value(name))';
    const endpoint = `/api/agiles/${agileId}/sprints/current/issues?fields=${fields}`;
    
    const data = await makeYouTrackRequest(endpoint);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for all issues
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
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for specific issue
app.get('/api/youtrack/issues/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;
    const fields = req.query.fields || 'idReadable,summary,description,created,updated';
    const endpoint = `/api/issues/${issueId}?fields=${fields}`;
    
    const data = await makeYouTrackRequest(endpoint);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for project custom fields
app.get('/api/youtrack/projects/:projectId/custom-fields', async (req, res) => {
  try {
    const { projectId } = req.params;
    const endpoint = `/api/admin/projects/${projectId}/customFields?fields=id,field(id,name,fieldType(id,name)),bundle(values(name))`;
    const data = await makeYouTrackRequest(endpoint);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for custom field values by field name
app.get('/api/youtrack/projects/:projectId/custom-fields/:fieldName', async (req, res) => {
  try {
    const { projectId, fieldName } = req.params;
    
    // First get all custom fields for the project
    const customFieldsEndpoint = `/api/admin/projects/${projectId}/customFields?fields=id,field(id,name,fieldType(id,name)),bundle(values(name))`;
    const customFieldsData = await makeYouTrackRequest(customFieldsEndpoint);
    
    // Find the field that matches our search (case-insensitive)
    const targetField = customFieldsData.find(field => 
      field.field && field.field.name && (
        field.field.name.toLowerCase().includes(fieldName.toLowerCase()) ||
        fieldName.toLowerCase().includes(field.field.name.toLowerCase())
      )
    );
    
    if (!targetField || !targetField.bundle || !targetField.bundle.values) {
      return res.status(404).json({ 
        error: `Custom field '${fieldName}' not found or doesn't have values in project ${projectId}`,
        timestamp: new Date().toISOString(),
        availableFields: customFieldsData
          .filter(f => f.field && f.field.name)
          .map(f => ({ name: f.field.name, hasBundle: !!f.bundle }))
      });
    }
    
    // Return the values directly from the bundle
    res.json(targetField.bundle.values);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 YouTrack Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${YOUTRACK_BASE_URL}`);
  console.log(`🔐 Using token: ${YOUTRACK_TOKEN.substring(0, 20)}...`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/youtrack/current-sprint - Current sprint issues`);
  console.log(`   GET /api/youtrack/issues - All issues`);
  console.log(`   GET /api/youtrack/issues/:id - Specific issue`);
  console.log(`   GET /api/youtrack/projects/:projectId/custom-fields - Project custom fields`);
  console.log(`   GET /api/youtrack/projects/:projectId/custom-fields/:fieldName - Custom field values`);
  console.log('');
});
