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
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
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
        Anterior
      </button>

      <div className="flex space-x-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-light font-orbitron">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors font-orbitron ${
                  currentPage === page
                    ? 'bg-neon-cyan text-space-black text-glow-cyan border-neon-cyan'
                    : 'text-ghost-white bg-dark-gray border border-dark-gray hover:bg-neon-cyan hover:text-space-black'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="flex items-center px-3 py-2 text-sm font-medium text-ghost-white bg-dark-gray border border-dark-gray rounded-lg hover:bg-neon-cyan hover:text-space-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-orbitron"
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default Pagination;