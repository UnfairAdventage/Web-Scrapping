import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = 1;
    let end = totalPages;
    if (totalPages <= maxVisible) {
      start = 1;
      end = totalPages;
    } else {
      if (currentPage <= 3) {
        start = 1;
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      } else {
        start = currentPage - 2;
        end = currentPage + 2;
      }
    }
    for (let i = start; i <= end; i++) {
      if (i > 0 && i <= totalPages) {
        pages.push(i);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="flex items-center px-3 py-2 text-sm font-medium text-ghost-white bg-dark-gray border border-dark-gray rounded-lg hover:bg-neon-cyan hover:text-space-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-orbitron"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex space-x-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors font-orbitron ${
              currentPage === page
                ? 'bg-neon-cyan text-space-black text-glow-cyan border-neon-cyan'
                : 'text-ghost-white bg-dark-gray border border-dark-gray hover:bg-neon-cyan hover:text-space-black'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="flex items-center px-3 py-2 text-sm font-medium text-ghost-white bg-dark-gray border border-dark-gray rounded-lg hover:bg-neon-cyan hover:text-space-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-orbitron"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default Pagination;