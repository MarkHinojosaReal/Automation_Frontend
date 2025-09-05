# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a YouTrack Frontend Dashboard - a modern, responsive frontend built with Gatsby, React, TypeScript, and Tailwind CSS. It connects to YouTrack for ticketing and reporting, featuring real-time statistics, ticket management, and analytics.

## Architecture

### Technology Stack
- **Frontend**: Gatsby 5.x with React 18 and TypeScript
- **Styling**: Tailwind CSS with custom color schemes (ocean, breeze, accent, glass)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Development Server**: Express proxy server for CORS handling
- **Build Tool**: Gatsby with TypeScript compilation

### Key Architectural Components

1. **Hybrid Data Fetching**: 
   - Development: Uses Express proxy server (`server/proxy.js`) to bypass CORS
   - Production: Direct YouTrack API calls with proper CORS configuration
   - Service layer (`src/services/youtrack.ts`) handles both modes automatically

2. **Type System**:
   - Comprehensive TypeScript interfaces in `src/types/index.ts`
   - YouTrack-specific types in `src/services/youtrack.ts`
   - Gatsby auto-generated types in `src/gatsby-types.d.ts`

3. **Component Architecture**:
   - Layout wrapper (`src/components/Layout.tsx`) with Header and Sidebar
   - Reusable UI components (StatsCard, TicketCard, ChartCard)
   - Page-based routing in `src/pages/`

4. **Data Flow**:
   - YouTrack service transforms API responses to internal ticket format
   - Custom hook (`src/hooks/useYouTrack.ts`) manages API state
   - Mock data (`src/utils/mockData.ts`) for development fallback

## Development Commands

### Essential Commands
- `npm run develop` - Start development with proxy server and Gatsby
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking
- `./start-dev.sh` - Comprehensive dev script with type checking

### Individual Commands
- `npm run proxy` - Start only the YouTrack proxy server (port 3001)
- `npm run gatsby-only` - Start only Gatsby dev server (port 8000)
- `npm run serve` - Serve production build locally
- `npm run clean` - Clean Gatsby cache
- `npm run deploy` - Build and deploy to GitHub Pages

### Development Workflow
1. Always run type check before development: `npm run type-check`
2. Use the comprehensive start script: `./start-dev.sh`
3. Access development at: http://localhost:8000
4. Proxy server health check: http://localhost:3001/health

## YouTrack Integration

### Configuration
- **Base URL**: `https://realbrokerage.youtrack.cloud`
- **Proxy Port**: 3001 (development)
- **Agile Board ID**: `124-333` (configurable via env vars)

### API Endpoints (via proxy)
- `/api/youtrack/current-sprint` - Current sprint issues
- `/api/youtrack/issues` - All issues (with pagination)
- `/api/youtrack/issues/:id` - Specific issue details

### Environment Variables
- `GATSBY_PROXY_URL` - Proxy server URL (default: http://localhost:3001)
- `GATSBY_USE_PROXY` - Force proxy usage in production
- `GATSBY_YOUTRACK_BASE_URL` - YouTrack instance URL
- `GATSBY_YOUTRACK_TOKEN` - API token for direct calls
- `GATSBY_YOUTRACK_AGILE_ID` - Agile board ID

## Code Style Guidelines

### TypeScript Requirements
- Use interfaces over types
- Avoid `any` and `unknown` - reference existing type definitions
- No type assertions with `as` or `!`
- Functional programming patterns, avoid classes
- Descriptive variable names with auxiliary verbs (isLoaded, hasError)

### React/Gatsby Patterns
- Use functional components with hooks
- Named exports for components and utilities
- Prefer useStaticQuery for build-time GraphQL data
- Use Gatsby Link for internal navigation
- Keep JSX minimal and declarative

### Styling Conventions
- Tailwind utility-first approach
- Mobile-first responsive design
- Use custom color scheme: ocean (primary), breeze (neutral), accent (highlight)
- Glass morphism effects available via custom glass colors

### File Structure Conventions
- Pages in `src/pages/` (auto-routing)
- Reusable components in `src/components/`
- Business logic in `src/services/` and `src/hooks/`
- Type definitions in `src/types/`
- Utilities in `src/utils/`

## Important Development Notes

### CORS Handling
The proxy server is essential for development due to YouTrack CORS policies. The service automatically switches between proxy and direct API calls based on environment.

### Authentication
YouTrack token is embedded in proxy server and service for development. In production, implement proper token management and authentication flow.

### Type Safety
The codebase maintains strict TypeScript compliance. Always run `npm run type-check` before commits. The start script will automatically fail if type checking doesn't pass.

### Build Process
Gatsby builds are optimized for GitHub Pages deployment with proper path prefixes. The build process includes image optimization and bundle splitting.