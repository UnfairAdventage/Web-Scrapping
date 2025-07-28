import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMoviePlayer, useSeriesData, usePlayerData } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Episode } from '../types';

interface PlayerPageProps {}

const PlayerPage: React.FC<PlayerPageProps> = () => {
  const { tipo, slug } = useParams<{ tipo: string; slug: string }>();
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [_, setSelectedSeason] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Parsear slug para series (formato: nombre-temporada-episodio)
  const parseSeriesSlug = (slug: string) => {
    const match = slug.match(/^(.+)-(\d+)x(\d+)$/);
    if (match) {
      return {
        seriesSlug: match[1],
        season: parseInt(match[2]),
        episode: parseInt(match[3])
      };
    }
    return null;
  };

  // Obtener datos según el tipo 
  const isMovie = tipo === 'pelicula';
  const isSeries = tipo === 'serie';
  
  const seriesInfo = isSeries ? parseSeriesSlug(slug || '') : null;
  const seriesSlug = seriesInfo?.seriesSlug || slug;

  // Hooks para obtener datos
  const { data: movieData, isLoading: movieLoading, error: movieError } = useMoviePlayer(
    isMovie ? (slug || '') : '',
    isMovie ? 'movie' : undefined
  );

  const { data: seriesData, isLoading: seriesLoading, error: seriesError } = useSeriesData(
    isSeries ? (seriesSlug || '') : ''
  );

  // Determinar qué datos usar
  const isLoading = isMovie ? movieLoading : seriesLoading;
  const error = isMovie ? movieError : seriesError;
  const data = isMovie ? movieData : seriesData;

  // Encontrar el episodio actual para series
  useEffect(() => {
    if (isSeries && seriesData && seriesInfo) {
      const episode = seriesData.episodes.find(
        ep => ep.season === seriesInfo.season && ep.episode === seriesInfo.episode
      );
      if (episode) {
        setCurrentEpisode(episode);
        setSelectedSeason(seriesInfo.season);
      }
    }
  }, [isSeries, seriesData, seriesInfo]);

  // Obtener datos del reproductor
  const videoUrl = isMovie 
    ? (movieData?.player_url || '')
    : (currentEpisode?.url || '');

  // Para películas, usar directamente la URL del iframe
  // Para series, usar usePlayerData para procesar la URL del episodio
  const { data: playerData, isLoading: playerLoading, error: playerError } = usePlayerData(
    isMovie ? '' : videoUrl // Solo usar usePlayerData para series
  );

  // Determinar la URL final del iframe
  const iframeUrl = isMovie 
    ? (movieData?.player_url || '')
    : (playerData?.player_url || '');

  // Limpiar anuncios del iframe
  const cleanAdsInIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      
      // Eliminar anuncios y overlays
      const adSelectors = [
        '.modal-content-vast', '#skipCountdown', 'video#adVideo', 'video#videoPlayer',
        '[id*="ad"]', '[class*="ad"]', '[id*="ads"]', '[class*="ads"]',
        '[id*="banner"]', '[class*="banner"]', '[id*="sponsor"]', '[class*="sponsor"]',
        '[id*="promo"]', '[class*="promo"]'
      ];
      
      adSelectors.forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => el.remove());
      });
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      cleanAdsInIframe();
    }
  }, [playerData]);

  // Navegación entre episodios
  const getCurrentEpisodeIndex = () => {
    if (!seriesData || !currentEpisode) return -1;
    return seriesData.episodes.findIndex(
      ep => ep.season === currentEpisode.season && ep.episode === currentEpisode.episode
    );
  };

  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!seriesData) return;
    
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < seriesData.episodes.length) {
      const newEpisode = seriesData.episodes[newIndex];
      const newSlug = `${seriesSlug}-${newEpisode.season}x${newEpisode.episode}`;
      navigate(`/ver/serie/${newSlug}`);
    }
  };

  // Manejar escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Contenido no encontrado</h2>
          <p className="text-gray-400 mb-4">
            El contenido que buscas no existe o ha sido eliminado.
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

  // Extraer información del contenido
  const title = isMovie 
    ? (movieData?.tituloReal || '')
    : (seriesData?.info?.title || '');
  
  const episodeTitle = currentEpisode ? ` - ${currentEpisode.title}` : '';
  const fullTitle = `${title}${episodeTitle}`;

  const sinopsis = isMovie 
    ? (movieData?.sinopsis || '')
    : (seriesData?.info?.sinopsis || '');

  const year = isMovie 
    ? (movieData?.fecha_estreno || '')
    : (seriesData?.info?.year || '');

  const genres = isMovie 
    ? (Array.isArray(movieData?.generos) ? movieData.generos.join(', ') : '')
    : (Array.isArray(seriesData?.info?.genres) ? seriesData.info.genres.join(', ') : '');

  const poster = isMovie 
    ? (movieData?.imagen_poster || '')
    : (seriesData?.info?.image || '');

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative">
        <div className="aspect-video bg-black">
          {playerLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : playerError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <p>Error al cargar el reproductor</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-neon-cyan text-space-black px-4 py-2 rounded"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : iframeUrl ? (
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              title={fullTitle}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={cleanAdsInIframe}
            />
          ) : null}
        </div>


      </div>

      {/* Footer compacto */}
      <div className="bg-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={poster}
              alt={title}
              className="w-12 h-16 object-cover rounded"
            />
            <div>
              <h2 className="text-white font-semibold text-sm">{fullTitle}</h2>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                {year && <span>{year}</span>}
                <span>Latino</span>
                {genres && <span>{genres.split(',')[0]}</span>}
              </div>
            </div>
          </div>
          
          {/* Sinopsis en el medio */}
          <div className="flex-1 mx-8">
            <p className="text-gray-300 text-xs line-clamp-2">{sinopsis}</p>
          </div>
          
          <div className="flex space-x-2">
            {isSeries && getCurrentEpisodeIndex() > 0 && (
              <button
                onClick={() => navigateToEpisode('prev')}
                disabled={getCurrentEpisodeIndex() <= 0}
                className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs hover:bg-neon-cyan hover:text-space-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 inline mr-1" />
              </button>
            )}
            
            {isSeries && getCurrentEpisodeIndex() < (seriesData?.episodes.length || 0) - 1 && (
              <button
                onClick={() => navigateToEpisode('next')}
                disabled={getCurrentEpisodeIndex() >= (seriesData?.episodes.length || 0) - 1}
                className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs hover:bg-neon-cyan hover:text-space-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 inline ml-1" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs hover:bg-neon-cyan hover:text-space-black transition-all duration-200"
            >
              <X className="h-4 w-4 inline mr-1" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage; 