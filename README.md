# YouTrack Frontend Dashboard

A modern, responsive frontend for YouTrack ticketing and reporting built with Gatsby, React, TypeScript, and Tailwind CSS.

## Features

- **Modern Dashboard**: Clean, intuitive interface with real-time ticket statistics
- **Ticket Management**: Browse, filter, and search tickets with advanced filtering options
- **Reporting & Analytics**: Comprehensive charts and metrics for tracking project health
- **Responsive Design**: Mobile-first design that works on all devices
- **TypeScript**: Full type safety throughout the application
- **Performance**: Built with Gatsby for optimal loading speeds

## Tech Stack

- **Framework**: Gatsby 5.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Automation_Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run develop
   ```

4. Open [http://localhost:8000](http://localhost:8000) to view the application.

### Available Scripts

- `npm run develop` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build locally
- `npm run clean` - Clean Gatsby cache
- `npm run type-check` - Run TypeScript type checking
- `npm run deploy` - Build and deploy to GitHub Pages

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Application header
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── TicketCard.tsx  # Individual ticket display
│   ├── TicketList.tsx  # Ticket listing with filters
│   ├── StatsCard.tsx   # Statistics display cards
│   └── ChartCard.tsx   # Chart containers
├── pages/              # Gatsby pages
│   ├── index.tsx       # Dashboard page
│   ├── tickets.tsx     # Tickets listing page
│   ├── reports.tsx     # Reports and analytics
│   ├── projects.tsx    # Projects overview
│   └── 404.tsx         # 404 error page
├── styles/             # Global styles
│   └── global.css      # Tailwind imports and custom styles
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
└── utils/              # Utility functions
    └── mockData.ts     # Mock data for development
```

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Access your site at `https://username.github.io/Automation_Frontend`

### Manual Deployment

```bash
npm run deploy
```

## Development

### Adding New Pages

1. Create a new file in `src/pages/`
2. Export a React component as default
3. Add navigation link in `src/components/Sidebar.tsx`

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use the defined color palette in `tailwind.config.js`
- Keep components modular and reusable

### Type Safety

- All components should be properly typed
- Use interfaces from `src/types/index.ts`
- Avoid `any` types - create proper interfaces instead

## YouTrack Integration

Currently using mock data. To integrate with YouTrack:

1. Add YouTrack API configuration
2. Replace mock data with API calls
3. Implement authentication
4. Add real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run type-check`
5. Build the project: `npm run build`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
