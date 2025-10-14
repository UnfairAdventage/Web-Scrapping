import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { usePlayerData, useCachedMovieData, useCachedSeriesData, useCachedAnimeData } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Episode } from '../types';

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

const PlayerPage: React.FC = () => {
  const { tipo, slug } = useParams<{ tipo: string; slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
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
  
  // Sistema de colores temático basado en el tipo de contenido
  const getThemeColors = () => {
    if (isMovie) {
      return {
        primary: 'fuchsia-pink',
        primaryText: 'text-fuchsia-pink',
        primaryBg: 'bg-fuchsia-pink',
        secondary: 'electric-sky',
        secondaryText: 'text-electric-sky',
        border: 'border-fuchsia-pink',
        hover: 'hover:bg-fuchsia-pink/20',
        glow: 'text-glow-fuchsia-pink'
      };
    } else if (isAnime) {
      return {
        primary: 'neon-magenta',
        primaryText: 'text-neon-magenta',
        primaryBg: 'bg-neon-magenta',
        secondary: 'deep-purple',
        secondaryText: 'text-deep-purple',
        border: 'border-neon-magenta',
        hover: 'hover:bg-neon-magenta/20',
        glow: 'text-glow-magenta-pink'
      };
    } else { // Series
      return {
        primary: 'neon-cyan',
        primaryText: 'text-neon-cyan',
        primaryBg: 'bg-neon-cyan',
        secondary: 'violet-blue',
        secondaryText: 'text-violet-blue',
        border: 'border-neon-cyan',
        hover: 'hover:bg-neon-cyan/20',
        glow: 'text-glow-cyan'
      };
    }
  };

  const theme = getThemeColors();
  
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

  // Agrupar episodios por temporada (solo para series y anime)
  const episodesBySeason = data?.episodes ? data.episodes.reduce((acc: Record<number, Episode[]>, episode: Episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = [];
    }
    acc[episode.season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>) : {};

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = episodesBySeason[selectedSeason] || [];

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

  // Actualizar temporada seleccionada cuando cambie el episodio actual
  useEffect(() => {
    if (currentEpisode && currentEpisode.season !== selectedSeason) {
      setSelectedSeason(currentEpisode.season);
    }
  }, [currentEpisode, selectedSeason]);

  // Función para cambiar de temporada y navegar al primer episodio
  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    
    // Navegar al primer episodio de la temporada seleccionada
    const seasonEpisodes = episodesBySeason[season];
    if (seasonEpisodes && seasonEpisodes.length > 0) {
      const firstEpisode = seasonEpisodes[0];
      const newSlug = `${seriesSlug}-${firstEpisode.season}x${firstEpisode.episode}`;
      const routeType = isAnime ? 'anime' : 'serie';
      navigate(`/ver/${routeType}/${newSlug}`);
    }
  };

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

  // Navegación entre episodios (solo dentro de la temporada actual)
  const getCurrentEpisodeIndex = () => {
    if (!currentSeasonEpisodes || !currentEpisode) return -1;
    return currentSeasonEpisodes.findIndex(
      (ep: Episode) => ep.season === currentEpisode.season && ep.episode === currentEpisode.episode
    );
  };

  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!currentSeasonEpisodes || currentSeasonEpisodes.length === 0) return;
    
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < currentSeasonEpisodes.length) {
      const newEpisode = currentSeasonEpisodes[newIndex];
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
    <div className={`bg-space-black text-ghost-white ${
      isMobilePortrait 
        ? 'fixed inset-0 z-50 flex flex-col' 
        : 'min-h-screen p-4 md:p-6'
    }`}>
      <div className={`max-w-7xl mx-auto ${
        isMobilePortrait 
          ? 'flex flex-col h-full' 
          : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
      }`}>
        
        {/* Columna principal: Reproductor + Info */}
        <div className={`${isMobilePortrait ? 'flex-1 flex flex-col' : 'lg:col-span-2 space-y-6'}`}>
          {/* Video Player */}
          <div className={`relative ${isMobilePortrait ? 'flex-1' : ''}`}>
            <div className={`bg-dark-gray rounded-xl overflow-hidden ${
              isMobilePortrait 
                ? 'h-full' 
                : 'w-full h-96 md:h-[32rem] lg:h-[40rem] xl:h-[30rem]'
            }`}>
              {playerLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : playerError ? (
                <div className="flex items-center justify-center h-full bg-black">
                  <div className="text-center text-ghost-white">
                    <p>Error al cargar el reproductor</p>
                    <button
                      onClick={() => window.location.reload()}
                      className={`mt-4 ${theme.primaryBg} text-space-black px-4 py-2 rounded-full font-medium transition ${theme.glow}`}
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
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-gray-light">
                  <span className="text-lg">▶ Video Player</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de navegación */}
          <div className={`flex gap-3 ${isMobilePortrait ? 'p-2' : ''}`}>
            {(isSeries || isAnime) && getCurrentEpisodeIndex() > 0 && (
              <button
                onClick={() => navigateToEpisode('prev')}
                disabled={getCurrentEpisodeIndex() <= 0}
                className={`px-5 py-2 bg-dark-gray hover:bg-gray-800 text-ghost-white rounded-full flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.primaryBg} hover:text-space-black`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
            )}
            
            {(isSeries || isAnime) && getCurrentEpisodeIndex() < (currentSeasonEpisodes.length || 0) - 1 && (
              <button
                onClick={() => navigateToEpisode('next')}
                disabled={getCurrentEpisodeIndex() >= (currentSeasonEpisodes.length || 0) - 1}
                className={`px-5 py-2 bg-dark-gray hover:bg-gray-800 text-ghost-white rounded-full flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.primaryBg} hover:text-space-black`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className={`px-5 py-2 bg-dark-gray hover:bg-gray-800 text-ghost-white rounded-full flex items-center gap-2 transition hover:${theme.primaryBg} hover:text-space-black`}
            >
              <X className="h-4 w-4" />
              Salir
            </button>
          </div>

          {/* Banner de título */}
          <div className={`${theme.primaryBg} text-space-black text-center py-2 px-4 rounded-full font-bold orbitron text-sm md:text-base truncate ${theme.glow}`}>
            {fullTitle} {isMovie ? '🎬' : isAnime ? '🌸' : '📺'}
          </div>

          {/* Información del episodio */}
          <div className="bg-dark-gray p-5 rounded-xl space-y-4">
            <h2 className={`${theme.primaryText} font-medium ${theme.glow}`}>{title}</h2>
            <h1 className="text-2xl md:text-3xl orbitron font-bold text-ghost-white">
              {isMovie ? 'Movie' : (currentEpisode ? `Episode ${currentEpisode.episode}` : 'Episode')}
            </h1>
            <p className="text-gray-light text-sm">
              {genres && genres.split(',')[0]} • {year} • Latino • {isMovie ? 'Movie' : (isAnime ? 'Anime' : 'Series')}
            </p>

            {/* Etiquetas */}
            {genres && (
              <div className="flex flex-wrap gap-2">
                {genres.split(',').slice(0, 4).map((genre: string, index: number) => {
                  const themeColors = isMovie 
                    ? ['fuchsia-pink', 'electric-sky', 'violet-blue', 'deep-purple']
                    : isAnime 
                    ? ['neon-magenta', 'deep-purple', 'magenta-pink', 'fuchsia-pink']
                    : ['neon-cyan', 'violet-blue', 'electric-sky', 'deep-purple'];
                  return (
                    <span 
                      key={index}
                      className={`px-3 py-1 bg-space-black text-${themeColors[index % themeColors.length]} rounded-full text-xs`}
                    >
                      {genre.trim()}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Descripción */}
            <p className="text-gray-light text-sm leading-relaxed">
              {sinopsis || 'Sinopsis no disponible'}
            </p>
          </div>
        </div>

        {/* Sidebar: Temporadas + Episodios + Poster (solo en desktop) */}
        {!isMobilePortrait && (isSeries || isAnime) && data && (
          <div className="space-y-6">
            {/* Selector de Temporadas */}
            {seasons.length > 1 && (
              <div className="bg-dark-gray p-5 rounded-xl">
                <h3 className="orbitron text-lg font-bold mb-3 text-ghost-white">Temporadas</h3>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => handleSeasonChange(season)}
                      className={`px-3 py-2 rounded-lg font-bold orbitron text-sm border-2 transition-colors ${
                        selectedSeason === season
                          ? `${theme.primaryBg} text-space-black border-current ${theme.glow}`
                          : 'bg-space-black text-gray-light border-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      S{season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Now Playing */}
            <div className="bg-dark-gray p-5 rounded-xl">
              <h3 className="orbitron text-lg font-bold mb-3 text-ghost-white">Now Playing</h3>
              <p className={`${theme.primaryText} mb-4 ${theme.glow}`}>
                {currentEpisode ? `Episode ${currentEpisode.episode}` : 'Episode'}
              </p>

              <div className="space-y-3">
                {/* Lista de episodios de la temporada seleccionada */}
                {currentSeasonEpisodes.slice(0, 10).map((episode: Episode) => {
                  const isCurrentEpisode = currentEpisode && 
                    episode.season === currentEpisode.season && 
                    episode.episode === currentEpisode.episode;
                  
                  return (
                    <div 
                      key={`${episode.season}-${episode.episode}`}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${
                        isCurrentEpisode 
                          ? `border-2 ${theme.border} bg-space-black/30` 
                          : `hover:bg-space-black ${theme.hover}`
                      }`}
                      onClick={() => {
                        const newSlug = `${seriesSlug}-${episode.season}x${episode.episode}`;
                        const routeType = isAnime ? 'anime' : 'serie';
                        navigate(`/ver/${routeType}/${newSlug}`);
                      }}
                    >
                      <div className="relative w-12 h-8 rounded-sm overflow-hidden flex-shrink-0">
                        {episode.image ? (
                          <img
                            src={episode.image}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${
                          isCurrentEpisode ? `${theme.primaryBg}` : 'bg-gray-700'
                        } ${episode.image ? 'hidden' : ''}`}>
                          <span className={`text-xs font-bold ${
                            isCurrentEpisode ? 'text-space-black' : 'text-gray-light'
                          }`}>
                            {episode.episode}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${isCurrentEpisode ? `font-bold ${theme.primaryText} ${theme.glow}` : ''} block truncate`}>
                          Episode {episode.episode}
                        </span>
                        {episode.title && (
                          <span className="text-xs text-gray-light truncate block">
                            {episode.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Poster */}
            <div className="bg-dark-gray h-80 rounded-xl flex items-center justify-center text-gray-light">
              <div className="text-center px-4">
                <img 
                  src={poster} 
                  alt={title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden">Image Poster<br /><span className="text-sm">{title}</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPage; 