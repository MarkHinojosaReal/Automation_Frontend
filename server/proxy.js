require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const automationsRoutes = require('./routes/automations');
const { registerYouTrackRoutes } = require('./routes/youtrack');
const { createMetabaseInspectHandler } = require('./utils/metabase');
const { createMetricsHandler } = require('./utils/metrics');
const { createDownloadTransactionHandler, createDownloadAgentHandler, createValidateTransactionHandler } = require('./utils/rezen');
const { createSearchHandler: createZendeskSearchHandler } = require('./utils/zendesk');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Add auth routes
app.use('/api/auth', authRoutes);

// YouTrack configuration
const YOUTRACK_BASE_URL = 'https://realbrokerage.youtrack.cloud';
const YOUTRACK_TOKEN = process.env.YOUTRACK_TOKEN;

// Helper function to make requests to YouTrack
async function makeYouTrackRequest(endpoint, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const url = `${YOUTRACK_BASE_URL}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${YOUTRACK_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ YouTrack API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      const err = new Error(`YouTrack API Error: ${response.status} ${response.statusText}`);
      err.statusCode = response.status;
      err.responseBody = errorText;
      throw err;
    }

    const data = await response.json();
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

app.get('/api/metrics', createMetricsHandler({ developmentTimeoutResponse: true }));
app.post('/api/metabase/inspect', createMetabaseInspectHandler());
registerYouTrackRoutes(app, makeYouTrackRequest, { includeTagRoute: true });

// Apply auth middleware to all API routes except auth routes
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  authMiddleware(req, res, next);
});

// Admin-only middleware for sensitive endpoints
const adminOnlyMiddleware = (req, res, next) => {
  const ADMIN_EMAILS = [
    'mark.hinojosa@therealbrokerage.com',
    'taylor.potter@therealbrokerage.com',
    'jenna.rozenblat@therealbrokerage.com',
    'guru.jorepalli@therealbrokerage.com',
    'akash.bawa@therealbrokerage.com',
    'nanda.anumolu@therealbrokerage.com',
    'rahul.dasari@therealbrokerage.com',
    'sreekanth.pogula@therealbrokerage.com',
    'soham.nehra@therealbrokerage.com',
  ];
  
  const userEmail = req.user?.email?.toLowerCase();
  
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};

// Automations routes (admin only)
app.use('/api/automations', adminOnlyMiddleware, automationsRoutes);

// reZEN file download routes (admin only)
app.post('/api/rezen/validate-transaction', adminOnlyMiddleware, createValidateTransactionHandler());
app.post('/api/rezen/download-transaction', adminOnlyMiddleware, createDownloadTransactionHandler());
app.post('/api/rezen/download-agent', adminOnlyMiddleware, createDownloadAgentHandler());

// Zendesk KB search route (admin only)
app.post('/api/zendesk/search', adminOnlyMiddleware, createZendeskSearchHandler());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 YouTrack Proxy Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 YouTrack Base: ${YOUTRACK_BASE_URL}`);
});

module.exports = app;