import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useMoviePlayer, useSeriesData, usePlayerData, useAnimeData, useCachedMovieData, useCachedSeriesData, useCachedAnimeData } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Episode } from '../types';

interface PlayerPageProps {}

// Hook para detectar orientación de pantalla
const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobileDevice = window.innerWidth <= 768;
      const isPortraitMode = window.innerHeight > window.innerWidth;
      
      setIsMobile(isMobileDevice);
      setIsPortrait(isPortraitMode);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return { isPortrait, isMobile, isMobilePortrait: isMobile && isPortrait };
};

const PlayerPage: React.FC<PlayerPageProps> = () => {
  const { tipo, slug } = useParams<{ tipo: string; slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [_, setSelectedSeason] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isMobilePortrait } = useOrientation();

  // Obtener datos pasados por el estado de navegación (si existen)
  const passedMovieData = location.state?.movieData;
  const passedSeriesData = location.state?.seriesData;
  const passedAnimeData = location.state?.animeData;
  const passedCurrentEpisode = location.state?.currentEpisode;

  // Parsear slug para series y animes (formato: nombre-temporada-episodio)
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
  const isAnime = tipo === 'anime';
  
  const seriesInfo = (isSeries || isAnime) ? parseSeriesSlug(slug || '') : null;
  const seriesSlug = seriesInfo?.seriesSlug || slug;

  // Hooks para obtener datos usando cache optimizado
  const { data: finalMovieData, isLoading: finalMovieLoading, error: finalMovieError } = useCachedMovieData(
    isMovie ? (slug || '') : '',
    passedMovieData
  );

  const { data: seriesData, isLoading: seriesLoading, error: seriesError } = useCachedSeriesData(
    isSeries ? (seriesSlug || '') : '',
    passedSeriesData
  );

  const { data: animeData, isLoading: animeLoading, error: animeError } = useCachedAnimeData(
    isAnime ? (seriesSlug || '') : '',
    passedAnimeData
  );

  // Determinar qué datos usar
  const isLoading = isMovie ? finalMovieLoading : (isSeries ? seriesLoading : animeLoading);
  const error = isMovie ? finalMovieError : (isSeries ? seriesError : animeError);
  
  // Obtener datos específicos según el tipo
  const currentSeriesData = isSeries ? seriesData : null;
  const currentAnimeData = isAnime ? animeData : null;
  const data = isSeries ? currentSeriesData : (isAnime ? currentAnimeData : null);

  // Encontrar el episodio actual para series y animes
  useEffect(() => {
    if ((isSeries || isAnime) && data && seriesInfo) {
      // Si tenemos el episodio pasado por navegación, usarlo
      if (passedCurrentEpisode) {
        setCurrentEpisode(passedCurrentEpisode);
        setSelectedSeason(passedCurrentEpisode.season);
      } else {
        // Buscar el episodio en los datos
        const episode = data.episodes.find(
          (ep: Episode) => ep.season === seriesInfo.season && ep.episode === seriesInfo.episode
        );
        if (episode) {
          setCurrentEpisode(episode);
          setSelectedSeason(seriesInfo.season);
        }
      }
    }
  }, [isSeries, isAnime, data, seriesInfo, passedCurrentEpisode]);

  // Obtener datos del reproductor
  const videoUrl = isMovie 
    ? (finalMovieData?.player_url || '')
    : (currentEpisode?.url || '');

  // Para películas, usar directamente la URL del iframe
  // Para series y animes, usar usePlayerData para procesar la URL del episodio
  const { data: playerData, isLoading: playerLoading, error: playerError } = usePlayerData(
    isMovie ? '' : videoUrl // Solo usar usePlayerData para series y animes
  );

  // Determinar la URL final del iframe
  const iframeUrl = isMovie 
    ? (finalMovieData?.player_url || '')
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
    if (!data || !currentEpisode) return -1;
    return data.episodes.findIndex(
      (ep: Episode) => ep.season === currentEpisode.season && ep.episode === currentEpisode.episode
    );
  };

  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!data) return;
    
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < data.episodes.length) {
      const newEpisode = data.episodes[newIndex];
      const newSlug = `${seriesSlug}-${newEpisode.season}x${newEpisode.episode}`;
      const routeType = isAnime ? 'anime' : 'serie';
      navigate(`/ver/${routeType}/${newSlug}`);
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

  if (error || (isMovie ? !finalMovieData : !data)) {
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
    ? (finalMovieData?.tituloReal || '')
    : (data?.info?.title || '');
  
  const episodeTitle = currentEpisode ? ` - ${currentEpisode.title}` : '';
  const fullTitle = `${title}${episodeTitle}`;

  const sinopsis = isMovie 
    ? (finalMovieData?.sinopsis || '')
    : (data?.info?.sinopsis || '');

  const year = isMovie 
    ? (finalMovieData?.fecha_estreno || '')
    : (data?.info?.year || '');

  const genres = isMovie 
    ? (Array.isArray(finalMovieData?.generos) ? finalMovieData.generos.join(', ') : '')
    : (Array.isArray(data?.info?.genres) ? data.info.genres.join(', ') : '');

  const poster = isMovie 
    ? (finalMovieData?.imagen_poster || '')
    : (data?.info?.image || '');

  return (
    <div className={`bg-black ${
      isMobilePortrait 
        ? 'fixed inset-0 z-50 flex flex-col' 
        : 'min-h-screen'
    }`}>
      {/* Video Player */}
      <div className={`relative ${isMobilePortrait ? 'flex-1' : ''}`}>
        <div className={`bg-black ${
          isMobilePortrait 
            ? 'h-full' // Ocupa toda la altura disponible en móviles verticales
            : 'aspect-video' // Aspect ratio normal para desktop y móviles horizontales
        }`}>
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

      {/* Footer compacto - Fixed en móviles verticales */}
      <div className={`bg-black ${
        isMobilePortrait 
          ? 'p-2 shadow-lg' 
          : 'p-4'
      }`}>
        {/* Layout responsive: horizontal en desktop, vertical en móvil */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          {/* Información del contenido */}
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={poster}
              alt={title}
              className={`object-cover rounded flex-shrink-0 ${
                isMobilePortrait ? 'w-10 h-12' : 'w-12 h-16'
              }`}
            />
            <div className="min-w-0 flex-1">
              <h2 className={`text-white font-semibold truncate ${
                isMobilePortrait ? 'text-xs' : 'text-sm'
              }`}>{fullTitle}</h2>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                {year && <span>{year}</span>}
                <span>Latino</span>
                {genres && <span className="truncate">{genres.split(',')[0]}</span>}
              </div>
            </div>
          </div>
          
          {/* Sinopsis - oculta en móvil para ahorrar espacio */}
          <div className="hidden md:block flex-1 mx-8">
            <p className="text-gray-300 text-xs line-clamp-2">{sinopsis}</p>
          </div>
          
          {/* Botones de navegación */}
          <div className="flex justify-center md:justify-end space-x-2">
            {(isSeries || isAnime) && getCurrentEpisodeIndex() > 0 && (
              <button
                onClick={() => navigateToEpisode('prev')}
                disabled={getCurrentEpisodeIndex() <= 0}
                className={`bg-gray-600 text-white rounded-full hover:bg-neon-cyan hover:text-space-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMobilePortrait ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'
                }`}
              >
                <ChevronLeft className="h-4 w-4 inline mr-1" />
              </button>
            )}
            
            {(isSeries || isAnime) && getCurrentEpisodeIndex() < (data?.episodes.length || 0) - 1 && (
              <button
                onClick={() => navigateToEpisode('next')}
                disabled={getCurrentEpisodeIndex() >= (data?.episodes.length || 0) - 1}
                className={`bg-gray-600 text-white rounded-full hover:bg-neon-cyan hover:text-space-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMobilePortrait ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'
                }`}
              >
                <ChevronRight className="h-4 w-4 inline ml-1" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className={`bg-gray-600 text-white rounded-full hover:bg-neon-cyan hover:text-space-black transition-all duration-200 ${
                isMobilePortrait ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'
              }`}
            >
              <X className="h-4 w-4 inline mr-1" />
              Salir
            </button>
          </div>
        </div>
        
        {/* Sinopsis visible solo en móvil, debajo de los botones */}
        <div className="md:hidden mt-2">
          <p className="text-gray-300 text-xs line-clamp-2">{sinopsis}</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage; 