# Deployment Guide - YouTrack Dashboard

## Render.com Deployment (Recommended)

This application is configured for easy deployment on Render.com with a single service that handles both the API proxy and static file serving.

### Quick Deploy Steps:

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository
2. **Connect to Render**: 
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New" → "Web Service"
   - Connect your GitHub repository
3. **Configure Service**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. **Add Environment Variables** (in Render dashboard):
   - `YOUTRACK_TOKEN`: `perm-bWFyay5oaW5vam9zYQ==.NTktMTU4.0k4Ad1tAdROERwu5cBfYRMdUcDS6T3`
   - `YOUTRACK_BASE_URL`: `https://realbrokerage.youtrack.cloud`
   - `NODE_ENV`: `production`

### Alternative: Using render.yaml

If you want to use Infrastructure as Code, Render will automatically detect the `render.yaml` file in your repo. You'll still need to manually set the `YOUTRACK_TOKEN` environment variable for security.

## Architecture

**Production Setup:**
- Single Node.js server serves both API endpoints (`/api/youtrack/*`) and static Gatsby files
- YouTrack API calls are proxied through the server to handle CORS
- Static files are served from the `/public` directory built by Gatsby

**Development Setup:**
- Gatsby dev server on port 8000
- Separate proxy server on port 3001
- Hot reloading and development features

## Environment Variables

Required in production:
- `YOUTRACK_TOKEN`: Your YouTrack API token
- `YOUTRACK_BASE_URL`: YouTrack instance URL (default: https://realbrokerage.youtrack.cloud)

Optional:
- `PORT`: Server port (Render sets this automatically)
- `NODE_ENV`: Environment (should be "production")

## Local Testing of Production Build

```bash
# Build the application
npm run build

# Start production server locally
npm start

# Visit http://localhost:3000
```

## Features Included

✅ **Full-stack single service deployment**  
✅ **CORS handling via server-side proxy**  
✅ **Environment variable configuration**  
✅ **Static file serving**  
✅ **Health check endpoint** (`/health`)  
✅ **Error handling and logging**  

## Support

The application includes:
- Projects filtering (ATOP only)
- Task management
- Priority visualization
- Request automation form
- Responsive design
- Real-time data fetching

## Security Notes

- YouTrack token is handled server-side only
- CORS is properly configured
- Environment variables are used for sensitive data
- No client-side API tokens exposed