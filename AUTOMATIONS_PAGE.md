# Automations Control Panel - "Scanner Darkly"

## Overview

A new admin-only page has been created to control automation states by toggling the `is_active` flag in the `src.automations` PostgreSQL table. This page provides real-time visibility and control over all automations in the system.

## Features

### 🔒 Security
- **Admin-only access**: Only users listed in `ADMIN_EMAILS` can access this page
- **Backend validation**: Both API endpoints validate admin privileges
- **Frontend protection**: Page redirects non-admin users to home
- **Navigation**: Only appears in sidebar for admin users

### 🔄 Real-time Updates
- **Auto-refresh**: Polls the database every 1 minute for changes
- **Instant updates**: When you toggle a switch, changes are immediate
- **Bidirectional sync**: Manual database updates are reflected in the UI within 1 minute

### 🎨 UI Components
- **Toggle switches**: Clean, accessible toggle UI for each automation
- **Confirmation modal**: Requires confirmation before toggling to prevent accidental changes
- **Status indicators**: Visual feedback for active/inactive states
- **Loading states**: Shows when updates are in progress
- **Error handling**: Displays errors if updates fail
- **Warning banner**: Reminds users that changes affect production

### 📊 Dashboard Stats
- Total automation count
- Active automation count
- Inactive automation count
- Last update timestamp

## Architecture

### Backend (Server)

#### New Files
1. **`/server/routes/automations.js`** - API routes for automations
   - `GET /api/automations` - Fetch all automations
   - `PUT /api/automations/:id` - Update is_active flag

#### Updated Files
1. **`/server/production-server.js`** - Added automations routes with admin middleware
2. **`/server/proxy.js`** - Added automations routes for local development

### Frontend (React/Gatsby)

#### New Files
1. **`/src/pages/automations.tsx`** - Main automations page
2. **`/src/components/AutomationToggle.tsx`** - Toggle switch component
3. **`/src/components/ConfirmationModal.tsx`** - Confirmation dialog component
4. **`/src/hooks/useAutomations.ts`** - Custom hook for fetching/updating automations
5. **`/src/types/automation.ts`** - TypeScript type definitions

#### Updated Files
1. **`/src/config/permissions.ts`** - Added automations page to admin-only pages

## Database Schema

The page interacts with the `src.automations` table with this structure:

```sql
CREATE TABLE src.automations (
  id uuid DEFAULT src.uuid_generate_v4() NOT NULL,
  platform text NULL,
  automation_name text NULL,
  created_at timestamp DEFAULT now() NULL,
  is_active bool NULL,
  initiative text NULL,
  CONSTRAINT automations_pkey PRIMARY KEY (id)
);
```

## API Endpoints

### GET /api/automations
Fetches all automations from the database.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "platform": "YouTrack",
    "automation_name": "My Automation",
    "is_active": true,
    "initiative": "Q1 2025",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### PUT /api/automations/:id
Updates the is_active flag for a specific automation.

**Request Body:**
```json
{
  "is_active": true
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "YouTrack",
  "automation_name": "My Automation",
  "is_active": true,
  "initiative": "Q1 2025",
  "created_at": "2025-01-01T00:00:00Z"
}
```

## Usage

### Accessing the Page
1. Navigate to `/automations` in your browser
2. The page will only be visible if you're logged in as an admin
3. Non-admin users will be redirected to the home page

### Toggling Automations
1. Click any toggle switch to enable/disable an automation
2. A confirmation modal will appear asking you to confirm the action
3. Click "Activate" or "Deactivate" to confirm, or "Cancel" to abort
4. The switch will show a loading state while updating
5. Once complete, the UI will reflect the new state
6. Changes are saved immediately to the database

### Monitoring Changes
- The page auto-refreshes every 1 minute
- Manual database changes will appear within 1 minute
- Check the "Last Updated" timestamp to see when data was last fetched
- View the stats at the top to see active/inactive counts
- Automations are organized by platform, then initiative, then name

## Environment Variables

The following environment variables must be set for the automations page to work:

```bash
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DATABASE=your-database-name
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
```

## Development

### Running Locally
```bash
# Start the development server
npm run develop

# The page will be available at:
# http://localhost:8000/automations
```

### Testing
1. Ensure your `.env` file has the correct Postgres credentials
2. Log in with an admin email
3. Navigate to `/automations`
4. Toggle a switch and verify:
   - The UI updates immediately
   - The database row is updated
   - Manual database changes appear on the next poll

## Security Considerations

⚠️ **Warning**: This page controls live automations in production. Exercise caution when toggling switches.

- All changes are immediate and affect production systems
- The page is admin-only and cannot be accessed by regular users
- Both frontend and backend enforce admin privileges
- All actions are logged in the server console

## Admin Emails

The following emails have access to this page (defined in `permissions.ts`):
- mark.hinojosa@therealbrokerage.com
- taylor.potter@therealbrokerage.com
- jenna.rozenblat@therealbrokerage.com
- guru.jorepalli@therealbrokerage.com
- akash.bawa@therealbrokerage.com
- nanda.anumolu@therealbrokerage.com
- rahul.dasari@therealbrokerage.com
- sreekanth.pogula@therealbrokerage.com
- soham.nehra@therealbrokerage.com

To add more admins, update the `ADMIN_EMAILS` array in:
- `/src/config/permissions.ts` (frontend)
- `/server/production-server.js` (backend)
- `/server/proxy.js` (development proxy)

## Troubleshooting

### Page not accessible
- Verify you're logged in with an admin email
- Check that your email is in the `ADMIN_EMAILS` list
- Clear your cookies and log in again

### Toggles not updating
- Check browser console for errors
- Verify Postgres credentials in `.env`
- Check server logs for database connection errors

### Changes not persisting
- Verify the database table exists
- Check that the user has write permissions
- Look for SQL errors in server logs

## Future Enhancements

Possible improvements for the future:
- Add audit logging to track who toggled what and when
- Add confirmation dialogs before toggling critical automations
- Add search/filter functionality for large numbers of automations
- Add grouping/categorization of automations
- Add last execution time/status for each automation
- Add ability to schedule automation state changes
- WebSocket integration for instant updates without polling

