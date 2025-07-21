import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMoviePlayer } from '../hooks/useApi';
import VideoModal from '../components/VideoModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, ArrowLeft, Calendar, Globe, Users } from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: playerData, isLoading, error } = useMoviePlayer(slug || '');

  if (isLoading || !playerData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" className="min-h-screen" />
      </div>
    );
  }

  if (error) {
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

  // Extraer datos de playerData
  const title = playerData.tituloReal || '';
  const sinopsis = playerData.sinopsis || 'Una emocionante película que te mantendrá entretenido de principio a fin. Disfruta de una experiencia cinematográfica única con excelente calidad de imagen y sonido.';
  const year = playerData.fecha_estreno || '';
  const genres = Array.isArray(playerData.generos) && playerData.generos.length > 0 ? playerData.generos.join(', ') : '';
  const language = 'Latino';
  const poster = playerData.imagen_poster || '';
  const alt = playerData.tituloReal || '';
  const videoUrl = playerData.player_url || '';

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
            src={poster}
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
              onClick={() => setIsModalOpen(true)}
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