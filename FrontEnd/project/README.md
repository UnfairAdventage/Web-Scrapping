# SoloLatino Streaming Catalog

A modern React streaming catalog application for browsing and watching Latino content.

## Features

- **Modern React Architecture**: Built with TypeScript, React Router, and React Query
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewing
- **Content Catalog**: Browse movies, series, anime, and more by category
- **Series Navigation**: Season and episode selection with detailed views
- **Video Player**: Modal-based video player with iframe embedding
- **Search & Filter**: Real-time search and category filtering
- **Loading States**: Comprehensive loading and error handling

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Build Tool**: Vite

## API Integration

The app integrates with a Flask backend API with the following endpoints:

- `GET /api/secciones` - Get available sections
- `GET /api/listado?seccion={section}&pagina={page}` - Get catalog items
- `GET /api/serie/{slug}` - Get series episodes by season
- `GET /api/pelicula/{slug}` - Get movie player data
- `GET /api/iframe_player?url={url}` - Get iframe player URL

## Available Sections

- Películas (Movies)
- Series
- Anime
- Películas Destacadas
- Caricaturas (Cartoons)
- K-Drama
- Amazon Prime
- Apple TV+
- Disney+
- HBO
- HBO Max
- Hulu
- Netflix

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Make sure your Flask API is running on `http://192.168.1.7:5000`**

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with header/footer
│   ├── CatalogGrid.tsx # Content grid display
│   ├── FilterBar.tsx   # Search and filter controls
│   ├── Pagination.tsx  # Page navigation
│   ├── VideoModal.tsx  # Video player modal
│   └── ...
├── pages/              # Page components
│   ├── CatalogPage.tsx # Main catalog page
│   ├── SeriesDetailPage.tsx # Series detail view
│   └── MovieDetailPage.tsx  # Movie detail view
├── hooks/              # Custom React hooks
│   └── useApi.ts       # API integration hooks
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx            # Main application component
```

## Key Features

### Responsive Catalog Grid
- Adaptive grid layout (2-5 columns based on screen size)
- Hover effects with play button overlay
- Content type badges (Movie/Series)
- Lazy loading for optimal performance

### Advanced Filtering
- Real-time search functionality
- Section-based filtering
- URL-based state management
- Pagination with page controls

### Series Navigation
- Season selection tabs
- Episode grid with thumbnails
- Play button for each episode
- Responsive episode layout

### Video Player
- Full-screen modal player
- Iframe-based video embedding
- Loading states and error handling
- Keyboard navigation (ESC to close)

### Error Handling
- Global error boundary
- API error states
- Retry functionality
- User-friendly error messages

## Development

The application uses modern React patterns and best practices:

- **TypeScript** for type safety
- **React Query** for efficient data fetching and caching
- **Custom hooks** for API integration
- **Error boundaries** for graceful error handling
- **Responsive design** with Tailwind CSS
- **Component composition** for reusability

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.