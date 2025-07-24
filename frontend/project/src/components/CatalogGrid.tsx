import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Globe } from 'lucide-react';
import { CatalogItem } from '../types';

interface CatalogGridProps {
  items: CatalogItem[];
  loading?: boolean;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({ items, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-700 rounded-lg aspect-[3/4] mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {items.map((item, idx) => (
        <Link
          key={item.id}
          to={
            item.type === 'series'
              ? `/series/${item.slug}`
              : item.type === 'anime'
                ? `/anime/${item.slug}`
                : `/movie/${item.slug}`
          }
          className="group block"
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 bg-dark-gray border-2 border-transparent group-hover:border-neon-cyan">
            <img
              src={item.image}
              alt={item.alt}
              className="w-full aspect-[3/4] object-cover"
              {...(idx === 0 ? {} : { loading: 'lazy' })}
            />
            {/* Etiqueta tipo */}
            <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold font-orbitron border-2 shadow-md transition-colors
              ${
                item.type === 'series'
                  ? 'bg-electric-sky text-space-black border-electric-sky text-glow-electric-sky box-glow-electric-sky'
                  : item.type === 'anime'
                    ? 'bg-magenta-pink text-space-black border-magenta-pink text-glow-magenta-pink box-glow-magenta-pink'
                    : 'bg-fuchsia-pink text-space-black border-fuchsia-pink text-glow-fuchsia-pink box-glow-fuchsia-pink'
              }`}>
              {item.type === 'series' ? 'Serie' : item.type === 'anime' ? 'Anime' : 'Película'}
            </span>
            {/* Overlay inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-space-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
              <Play className="h-8 w-8 text-neon-cyan text-glow-cyan mb-1" />
              <div className="flex items-center space-x-2 text-xs text-gray-light">
                <Calendar className="h-3 w-3" />
                <span>{item.year || ''}</span>
                <Globe className="h-3 w-3" />
                <span>{item.language}</span>
              </div>
            </div>
          </div>
          <h3 className="text-sm font-bold text-neon-cyan text-glow-cyan font-orbitron group-hover:text-neon-cyan transition-colors line-clamp-2 mt-2">
            {item.title}
          </h3>
          <p className="text-xs text-gray-light mt-1 font-roboto">{item.genres}</p>
        </Link>
      ))}
    </div>
  );
};

export default CatalogGrid;