import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeriesData } from '../hooks/useApi';
import VideoModal from '../components/VideoModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, ArrowLeft, Calendar, Globe, Users } from 'lucide-react';
import { Episode } from '../types';

const SeriesDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  const { data: seriesData, isLoading, error } = useSeriesData(slug || '');

  const handlePlayEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" className="min-h-screen" />
      </div>
    );
  }

  if (error || !seriesData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Serie no encontrada</h2>
          <p className="text-gray-400 mb-4">
            La serie que buscas no existe o ha sido eliminada.
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

  const { info, episodes } = seriesData;

  const tituloReal = info.tituloReal || info.title;
  const sinopsis = info.sinopsis || 'Una emocionante serie que te mantendrá al borde de tu asiento con cada episodio. Descubre una trama llena de acción, drama y personajes memorables.';

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = [];
    }
    acc[episode.season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = episodesBySeason[selectedSeason] || [];

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

      {/* Series Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <img
            src={info.image}
            alt={info.alt}
            className="w-full lg:w-80 rounded-lg shadow-xl"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-4">{tituloReal}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="flex items-center text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {info.year}
            </span>
            <span className="flex items-center text-gray-400">
              <Globe className="h-4 w-4 mr-1" />
              {info.language}
            </span>
            <span className="flex items-center text-gray-400">
              <Users className="h-4 w-4 mr-1" />
              {info.genres}
            </span>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {sinopsis}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handlePlayEpisode(currentSeasonEpisodes[0])}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className="h-5 w-5 mr-2" />
              Reproducir primer episodio
            </button>
          </div>
        </div>
      </div>

      {/* Season Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Temporadas</h2>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSeason === season
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Temporada {season}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Episodios - Temporada {selectedSeason}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentSeasonEpisodes.map((episode) => (
            <div
              key={`${episode.season}-${episode.episode}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => handlePlayEpisode(episode)}
            >
              <div className="relative">
                <img
                  src={episode.image}
                  alt={episode.title}
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-white mb-1">
                  {episode.episode}. {episode.title}
                </h4>
                <p className="text-sm text-gray-400">
                  {new Date(episode.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={currentEpisode?.url || ''}
        title={currentEpisode ? `${info.title} - ${currentEpisode.title}` : ''}
      />
    </div>
  );
};

export default SeriesDetailPage;