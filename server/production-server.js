const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// YouTrack configuration
const YOUTRACK_BASE_URL = process.env.YOUTRACK_BASE_URL;
const YOUTRACK_TOKEN = process.env.YOUTRACK_TOKEN;

// Validate required environment variables
if (!YOUTRACK_BASE_URL) {
  console.error('❌ YOUTRACK_BASE_URL environment variable is required');
  process.exit(1);
}

if (!YOUTRACK_TOKEN) {
  console.error('❌ YOUTRACK_TOKEN environment variable is required');
  process.exit(1);
}

// Helper function to make requests to YouTrack
async function makeYouTrackRequest(endpoint, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const url = `${YOUTRACK_BASE_URL}${endpoint}`;
    console.log(`🚀 Proxying ${method} request to: ${url}`);
    
    const requestOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${YOUTRACK_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
      console.log(`📝 Request body:`, body);
    }
    
    const response = await fetch(url, requestOptions);

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
    console.log(`✅ Successfully ${method === 'POST' ? 'created' : 'fetched'} ${Array.isArray(data) ? data.length : 'data'} items`);
    return data;
  } catch (error) {
    console.error('❌ Proxy request failed:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'YouTrack proxy server is running' });
});

// API Routes
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

// POST endpoint for creating issues
app.post('/api/youtrack/issues', async (req, res) => {
  try {
    console.log('🆕 Creating new YouTrack issue');
    const endpoint = '/api/issues';
    
    const data = await makeYouTrackRequest(endpoint, 'POST', req.body);
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

// Proxy endpoint for custom field values
app.get('/api/youtrack/projects/:projectId/custom-fields/:fieldName', async (req, res) => {
  try {
    const { projectId, fieldName } = req.params;
    const endpoint = `/api/admin/projects/${projectId}/customFields?fields=field(fieldType(valueType),name),bundle(values(name))&query=${encodeURIComponent(`field: {${fieldName}}`)}`;
    
    const data = await makeYouTrackRequest(endpoint);
    
    // Extract the values from the response
    if (data && data.length > 0 && data[0].bundle && data[0].bundle.values) {
      res.json(data[0].bundle.values);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metabase card inspector endpoint
app.post('/api/metabase/inspect', async (req, res) => {
  try {
    const { cardId } = req.body;
    
    if (!cardId) {
      return res.status(400).json({ error: 'Card ID is required' });
    }

    // Path to the Python script
    const scriptPath = path.join(__dirname, '..', 'metabase_inspector.py');
    
    // Spawn Python process
    const { spawn } = require('child_process');
    const python = spawn('python3', [scriptPath, cardId]);
    
    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).send(`Error executing script: ${errorOutput}`);
      }
      
      // Return plaintext response
      res.setHeader('Content-Type', 'text/plain');
      res.send(output);
    });

    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      res.status(500).send(`Failed to execute script: ${error.message}`);
    });

  } catch (error) {
    console.error('Metabase inspection error:', error);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

// Generic proxy endpoint
app.all('/api/youtrack/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/youtrack', '');
    const queryString = new URLSearchParams(req.query).toString();
    const endpoint = queryString ? `${path}?${queryString}` : path;
    
    const data = await makeYouTrackRequest(endpoint);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from Gatsby build
app.use(express.static(path.join(__dirname, '../public')));

// Catch all handler: send back index.html for any non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 Production Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 YouTrack Base: ${YOUTRACK_BASE_URL}`);
  console.log(`🏠 Serving static files from: ${path.join(__dirname, '../public')}`);
});

module.exports = app;