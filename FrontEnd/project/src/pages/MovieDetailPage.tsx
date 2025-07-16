import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog, useMoviePlayer } from '../hooks/useApi';
import VideoModal from '../components/VideoModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, ArrowLeft, Calendar, Globe, Users } from 'lucide-react';
import { CatalogItem } from '../types';

const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For this demo, we'll get the movie from the catalog
  // In a real app, you'd have a separate API endpoint for movie details
  const { data: catalogData, isLoading, error } = useCatalog(1, '', '');
  const { data: playerData } = useMoviePlayer(slug || '') as { data?: { player_url: string; source: string; format: string; sinopsis?: string; tituloReal?: string } };
  const movie = catalogData?.items.find(item => item.slug === slug && item.type === 'movie');

  // Buscar película por término representativo (tituloReal, alt, title, slug)
  async function fetchMovieBySlugOrTitle(): Promise<CatalogItem | null> {
    // Determinar el mejor término de búsqueda
    const searchTerm = playerData?.tituloReal || movie?.alt || movie?.title || (slug ? slug.replace(/-/g, ' ') : '');
    if (!searchTerm) return null;
    let pagina = 1;
    let encontrado = null;
    let totalPaginas = 1;
    while (!encontrado && pagina <= totalPaginas) {
      const res = await fetch(`/api/listado?pagina=${pagina}&busqueda=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (Array.isArray(data.resultados)) {
        // Buscar por slug o por coincidencia de título
        encontrado = data.resultados.find((item: CatalogItem) =>
          item.slug === slug ||
          item.title?.toLowerCase() === searchTerm.toLowerCase() ||
          item.alt?.toLowerCase() === searchTerm.toLowerCase()
        );
      }
      totalPaginas = data.total_paginas || 1;
      pagina++;
    }
    return encontrado;
  }

  // Hook de imagen SIEMPRE antes de cualquier return
  const [image, setImage] = useState<string>(movie?.image || '');
  const [isFetchingAltImage, setIsFetchingAltImage] = useState(false);

  useEffect(() => {
    setImage(movie?.image || '');
  }, [movie?.image, slug]);

  useEffect(() => {
    let cancelled = false;
    if (!image && slug) {
      setIsFetchingAltImage(true);
      fetchMovieBySlugOrTitle()
        .then(found => {
          if (!cancelled && found && found.image) {
            setImage(found.image);
          }
          setIsFetchingAltImage(false);
        })
        .catch(() => {
          if (!cancelled) setIsFetchingAltImage(false);
        });
    }
    return () => { cancelled = true; };
  }, [image, slug, playerData?.tituloReal, movie?.alt, movie?.title]);

  const sinopsis = playerData?.sinopsis || movie?.sinopsis ||
    'Una emocionante película que te mantendrá entretenido de principio a fin. Disfruta de una experiencia cinematográfica única con excelente calidad de imagen y sonido.';

  const handlePlayMovie = () => {
    setIsModalOpen(true);
  };

  if (isLoading || isFetchingAltImage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" className="min-h-screen" />
      </div>
    );
  }

  if (error || (!movie && !playerData)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Película no encontrada</h2>
          <p className="text-gray-400 mb-4">
            La película que buscas no existe o ha sido eliminada.
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Usar datos de playerData si existen, si no, usar los del catálogo
  const alt = movie?.alt || playerData?.tituloReal || '';
  const year = movie?.year || '';
  const language = movie?.language || 'Latino';
  const genres = movie?.genres || '';

  // Cambios aquí: priorizar playerData para título y sinopsis
  const title = playerData?.tituloReal || movie?.tituloReal || movie?.title || '';
  const videoUrl = playerData?.player_url || movie?.url || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al catálogo
      </Link>

      {/* Movie Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <img
            src={image}
            alt={alt}
            className="w-full lg:w-80 rounded-lg shadow-xl"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="flex items-center text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {year}
            </span>
            <span className="flex items-center text-gray-400">
              <Globe className="h-4 w-4 mr-1" />
              {language}
            </span>
            <span className="flex items-center text-gray-400">
              <Users className="h-4 w-4 mr-1" />
              {genres}
            </span>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {sinopsis}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handlePlayMovie}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className="h-5 w-5 mr-2" />
              Reproducir película
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={videoUrl}
        title={title}
      />
    </div>
  );
};

export default MovieDetailPage;