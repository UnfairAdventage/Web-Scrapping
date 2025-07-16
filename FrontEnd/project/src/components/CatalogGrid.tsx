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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
          <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
            <img
              src={item.image}
              alt={item.alt}
              className="w-full aspect-[3/4] object-cover"
              {...(idx === 0 ? {} : { loading: 'lazy' })}
            />
            {/* Etiqueta tipo */}
            <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
              item.type === 'series'
                ? 'bg-blue-600 text-white'
                : item.type === 'anime'
                  ? 'bg-pink-600 text-white'
                  : 'bg-green-600 text-white'
            }`}>
              {item.type === 'series' ? 'Serie' : item.type === 'anime' ? 'Anime' : 'Película'}
            </span>
            {/* Overlay inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
              <Play className="h-8 w-8 text-white mb-1" />
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Calendar className="h-3 w-3" />
                <span>{item.year}</span>
                <Globe className="h-3 w-3" />
                <span>{item.language}</span>
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mt-2">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{item.genres}</p>
        </Link>
      ))}
    </div>
  );
};

export default CatalogGrid;