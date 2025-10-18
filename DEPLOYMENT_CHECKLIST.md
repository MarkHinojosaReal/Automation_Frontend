# Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Server Files Match
- ✅ `server/proxy.js` - Development server with auth
- ✅ `server/production-server.js` - Production server with auth + static file serving
- ✅ Both servers have:
  - Google OAuth routes (`/api/auth/*`)
  - Auth middleware protecting API routes
  - Metabase card inspector endpoint
  - YouTrack proxy endpoints
  - Metrics endpoint (Postgres)

### 2. Authentication System
- ✅ Google OAuth 2.0 integrated
- ✅ JWT token-based sessions (24h expiry)
- ✅ Inactivity timeout (30 minutes)
- ✅ HTTP-only cookies
- ✅ Email domain restriction (@therealbrokerage.com)
- ✅ All pages protected except `/login` and `/404`
- ✅ Client-side auth guard (Gatsby)
- ✅ Server-side auth middleware (Express)

### 3. Environment Variables
All required variables are in `.env.example` and `render.yaml`:
- ✅ `YOUTRACK_BASE_URL`
- ✅ `YOUTRACK_TOKEN`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `JWT_SECRET`
- ✅ `POSTGRES_HOST`
- ✅ `POSTGRES_PORT`
- ✅ `POSTGRES_DATABASE`
- ✅ `POSTGRES_USER`
- ✅ `POSTGRES_PASSWORD`
- ✅ `METABASE_BASE_URL`
- ✅ `METABASE_API_KEY`

---

## 🚀 Deployment Steps

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project (or create one)
3. Click "OAuth 2.0 Client IDs" for your app
4. Add **Authorized JavaScript origins**:
   - `https://youtrack-frontend-dashboard.onrender.com`
5. Add **Authorized redirect URIs**:
   - `https://youtrack-frontend-dashboard.onrender.com/auth/callback`
6. Save changes (may take 5-10 minutes to propagate)

### Step 2: Render Dashboard Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your `youtrack-dashboard` service
3. Go to **Environment** tab
4. Set the following secret variables:

```bash
YOUTRACK_TOKEN=perm:xxx...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx...
JWT_SECRET=<generate with: openssl rand -base64 32>
POSTGRES_HOST=<your-postgres-host>
POSTGRES_DATABASE=<your-db-name>
POSTGRES_USER=<your-username>
POSTGRES_PASSWORD=<your-password>
METABASE_API_KEY=mb_xxx...
```

5. **Important**: Make sure these are set:
   - ✅ `NODE_ENV=production` (should already be set)
   - ✅ `YOUTRACK_BASE_URL=https://realbrokerage.youtrack.cloud` (should already be set)
   - ✅ `METABASE_BASE_URL=https://metabase.therealbrokerage.com` (should already be set)
   - ✅ `POSTGRES_PORT=5432` (should already be set)

### Step 3: Generate JWT Secret
If you don't have a JWT secret yet, generate one:

```bash
openssl rand -base64 32
```

Copy the output and add it to Render as `JWT_SECRET`.

### Step 4: Deploy
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: add Google OAuth authentication"
   git push origin main
   ```

2. Render will automatically detect the push and deploy
3. Monitor the deployment logs in Render dashboard
4. Wait for deployment to complete (~3-5 minutes)

### Step 5: Verify Deployment
1. Visit `https://youtrack-frontend-dashboard.onrender.com`
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Login with your `@therealbrokerage.com` account
5. You should be redirected to the dashboard
6. Test navigating to different pages
7. Test logging out (bottom of sidebar)
8. Verify you're redirected back to login

---

## 🔍 Post-Deployment Testing

### Test Authentication Flow
- [ ] Unauthenticated user redirected to `/login`
- [ ] Google sign-in works
- [ ] Only @therealbrokerage.com emails allowed
- [ ] User info displayed in sidebar
- [ ] Logout button works
- [ ] After logout, redirected to `/login`

### Test All Pages
- [ ] Home (/)
- [ ] Projects (/projects)
- [ ] Tasks (/tasks)
- [ ] Tools (/tools)
- [ ] API Docs (/api-docs)
- [ ] Metrics (/metrics)
- [ ] New Request (/request)
  - [ ] Email field auto-populated
  - [ ] Email field disabled

### Test Auto-Logout
- [ ] Inactivity timeout (30 minutes) - optional, long test
- [ ] Token expiration (24 hours) - optional, very long test

### Test API Endpoints
- [ ] YouTrack data loads on home page
- [ ] Projects page loads data
- [ ] Tasks page loads data
- [ ] Metrics page loads (if Postgres configured)
- [ ] Metabase Card Inspector tool works
- [ ] Project Report Generator works

---

## 🛟 Troubleshooting

### Issue: "Access blocked: Authorization Error"
**Solution**: Add production URL to Google OAuth authorized origins
- Go to Google Cloud Console
- Add `https://youtrack-frontend-dashboard.onrender.com` to authorized origins

### Issue: "Authentication failed"
**Solution**: Check JWT_SECRET is set in Render
- Verify `JWT_SECRET` exists in Environment tab
- Regenerate if needed: `openssl rand -base64 32`

### Issue: "Invalid token" or immediate logout
**Solution**: Check JWT_SECRET matches between login and verification
- Ensure `JWT_SECRET` is consistent
- Clear cookies and try logging in again

### Issue: Pages not loading/infinite redirects
**Solution**: Check client-side auth context
- Verify `/login` page loads without redirects
- Check browser console for errors
- Verify cookies are being set (check DevTools → Application → Cookies)

### Issue: "No token provided" on API calls
**Solution**: Check auth middleware configuration
- Verify `/api/auth/*` routes are excluded from auth middleware
- Check cookies are being sent with requests (`credentials: 'include'`)

### Issue: Metrics page fails
**Solution**: Verify Postgres environment variables
- All `POSTGRES_*` variables must be set in Render
- Test connection from Render shell if needed

---

## 📝 Notes

### Security Features Implemented
- ✅ HTTP-only cookies (XSS protection)
- ✅ SameSite: strict (CSRF protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ Email domain restriction
- ✅ JWT signature verification
- ✅ Inactivity timeout (30 minutes)
- ✅ Token expiration (24 hours)
- ✅ Server-side and client-side auth checks

### Future Improvements
- [ ] Add refresh token for seamless token renewal
- [ ] Add "Remember Me" option for longer sessions
- [ ] Add audit logging for security events
- [ ] Add rate limiting on auth endpoints
- [ ] Add 2FA for additional security

---

## 🎉 Deployment Complete!

If all tests pass, your application is successfully deployed with full authentication! 🚀

