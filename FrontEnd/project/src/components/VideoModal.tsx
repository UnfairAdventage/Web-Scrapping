import React, { useEffect, useRef } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { usePlayerData } from '../hooks/useApi';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  const { data: playerData, isLoading, error } = usePlayerData(videoUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const blockedDomains = [
    'bvtpk.com/tag.min.js',
    'earnvids.com/upload-data/logo_29308.png',
    'mc.yandex.ru/metrika/tag.js',
    'media.dalyio.com/js/code.min.js',
    'www.googletagmanager.com/gtag/js?id=G-48ZJD1VPGZ'
  ];

  const cleanAdsInIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;

      // Elimina el modal de anuncios VAST
      doc.querySelectorAll('.modal-content-vast, #skipCountdown').forEach(el => el.remove());

      // También puedes eliminar el video de anuncio si lo deseas
      doc.querySelectorAll('video#adVideo, video#videoPlayer').forEach(el => el.remove());

      // Elimina otros posibles overlays o banners
      const adSelectors = [
        '[id*="ad"]',
        '[class*="ad"]',
        '[id*="ads"]',
        '[class*="ads"]',
        '[id*="banner"]',
        '[class*="banner"]',
        '[id*="sponsor"]',
        '[class*="sponsor"]',
        '[id*="promo"]',
        '[class*="promo"]'
      ];
      doc.querySelectorAll(adSelectors.join(',')).forEach(el => el.remove());

      // Elimina scripts, iframes e imágenes de los dominios bloqueados
      const selectors = ['script[src]', 'iframe[src]', 'img[src]'];
      doc.querySelectorAll(selectors.join(',')).forEach(el => {
        const src = el.getAttribute('src') || '';
        if (blockedDomains.some(domain => src.includes(domain))) {
          el.remove();
        }
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      cleanAdsInIframe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white truncate">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Video Content */}
          <div className="aspect-video bg-black">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-400">Cargando reproductor...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-400">Error al cargar el reproductor</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {playerData && (
              <iframe
                ref={iframeRef}
                src={playerData.player_url}
                title={title}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                loading="lazy"
                referrerPolicy='no-referrer'
                onLoad={cleanAdsInIframe}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;