require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const automationsRoutes = require('./routes/automations');
const { registerYouTrackRoutes } = require('./routes/youtrack');
const { createMetabaseInspectHandler } = require('./utils/metabase');
const { createMetricsHandler } = require('./utils/metrics');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Add auth routes (must come before auth middleware)
app.use('/api/auth', authRoutes);

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

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID environment variable is required');
  process.exit(1);
}

// Helper function to make requests to YouTrack
async function makeYouTrackRequest(endpoint, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const url = `${YOUTRACK_BASE_URL}${endpoint}`;

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
app.get('/api/metrics', createMetricsHandler());
app.post('/api/metabase/inspect', createMetabaseInspectHandler());
registerYouTrackRoutes(app, makeYouTrackRequest, { includeTagRoute: true });

// Serve static files from the dist directory built by Vite
// Note: Vite builds to /opt/render/project/src/dist
// Server is at /opt/render/project/src/server/production-server.js
// So we go up one level: server/ -> src/, then access dist/
const publicDir = path.join(__dirname, '../dist');
app.use(express.static(publicDir, {
  index: false // Don't serve index.html automatically, we'll handle routing
}));

// Serve login page without auth (SPA - single index.html handles all routes)
app.get('/login', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Middleware to check authentication for all other routes (HTML pages only)
app.use((req, res, next) => {
  // Skip auth for login page, static files (js, css, etc), and auth API
  if (req.path === '/login' || 
      req.path.startsWith('/api/auth') ||
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|json)$/)) {
    return next();
  }
  
  // Check for auth token
  const token = req.cookies.auth_token;
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if email domain is @therealbrokerage.com
    if (!decoded.email || !decoded.email.endsWith('@therealbrokerage.com')) {
      return res.redirect('/login');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
});

// Serve all other routes (protected)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
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
  const fs = require('fs');
  const indexPath = path.join(publicDir, 'index.html');

  console.log(`🌟 Production Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 YouTrack Base: ${YOUTRACK_BASE_URL}`);
  console.log(`🏠 Dist directory: ${publicDir}`);
  console.log(`📁 Dist dir exists: ${fs.existsSync(publicDir)}`);

  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    console.log(`📂 Files in dist/: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
  }

  console.log(`📄 Index page exists: ${fs.existsSync(indexPath)}`);
  console.log(`🔒 Auth middleware enabled for all routes except /login and /api/auth`);
});

module.exports = app;