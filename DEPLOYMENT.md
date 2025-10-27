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
- `GOOGLE_CLIENT_ID`: Google OAuth client ID for authentication
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `JWT_SECRET`: Secret key for JWT token generation
- `METABASE_API_KEY`: Metabase API key for analytics and reporting
- `ARRAKIS_API_KEY`: Arrakis API key for bulk transaction operations

Database (Postgres):
- `POSTGRES_HOST`: Postgres database host
- `POSTGRES_PORT`: Postgres database port (default: 5432)
- `POSTGRES_DATABASE`: Postgres database name
- `POSTGRES_USER`: Postgres username
- `POSTGRES_PASSWORD`: Postgres password

Optional:
- `PORT`: Server port (Render sets this automatically)
- `NODE_ENV`: Environment (should be "production")
- `METABASE_BASE_URL`: Metabase instance URL (default: https://metabase.therealbrokerage.com)

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

## Tools Available

The application includes several automation tools:

### 1. Metabase Card Inspector
- Inspect Metabase cards to view SQL queries and column metadata
- Useful for debugging and analysis
- Endpoint: `/api/metabase/inspect`

### 2. Project Report Generator
- Generate comprehensive reports showing completed and upcoming automation projects
- Includes time savings and cost impact analysis
- Endpoint: `/api/youtrack/issues` (with custom queries)

### 3. Bulk Transaction Termination
- Automatically terminate transactions from Metabase query results
- Fetches data from Metabase card 5342
- Extracts transaction IDs from URLs
- Marks each transaction as termination-requested and terminated
- Generates detailed report of successes and failures
- Endpoint: `/api/tools/terminate-transactions`
- **Requirements**: `METABASE_API_KEY` and `ARRAKIS_API_KEY` environment variables

## Application Features

The application includes:
- Projects filtering (ATOP only)
- Task management
- Priority visualization
- Request automation form
- Responsive design
- Real-time data fetching
- Role-based access control (admin vs regular users)
- Google OAuth authentication

## Security Notes

- YouTrack token is handled server-side only
- CORS is properly configured
- Environment variables are used for sensitive data
- No client-side API tokens exposed