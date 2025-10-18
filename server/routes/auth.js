const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google - Verify Google ID token
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Check email domain
    if (!email || !email.endsWith('@therealbrokerage.com')) {
      return res.status(403).json({ 
        error: 'Access denied. Only @therealbrokerage.com emails are allowed.' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        email: email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      success: true, 
      user: { 
        email: email, 
        name: payload.name, 
        picture: payload.picture 
      } 
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
