import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const SeriesDetailPage = lazy(() => import('./pages/SeriesDetailPage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const AnimeDetailPage = lazy(() => import('./pages/AnimeDetailPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Suspense fallback={<div className="text-center text-white py-10">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/page/1" replace />} />
                <Route path="/page/:pageNumber" element={<CatalogPage section="" />} />
                <Route path="/peliculas" element={<CatalogPage section="Películas" />} />
                <Route path="/series" element={<CatalogPage section="Series" />} />
                <Route path="/series/:slug" element={<SeriesDetailPage />} />
                <Route path="/movie/:slug" element={<MovieDetailPage />} />
                <Route path="/anime/:slug" element={<AnimeDetailPage />} />
                {/* <Route path="*" element={<Navigate to="/page/1" replace />} /> */}
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;