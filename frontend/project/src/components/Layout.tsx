import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Play, Home, Menu, X, Clapperboard, Film, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LayoutProps {
  children: React.ReactNode;
}

const GITHUB_URL = 'https://github.com/UnfairAdventage/Web-Scrapping';
const VERSION_API = '/api/version';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showUpdate, setShowUpdate] = React.useState(false);
  const [showChanges, setShowChanges] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState<any>(null);
  const [showUpdateButton, setShowUpdateButton] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    fetch(VERSION_API)
      .then(res => res.json())
      .then(data => {
        setUpdateInfo(data);
        if (data.update_available) {
          const ignoreKey = `update_ignored_${data.latest_version}`;
          if (!localStorage.getItem(ignoreKey)) {
            setShowUpdate(true);
          } else {
            setShowUpdateButton(true);
          }
        } else if (data.changes && data.version === data.latest_version) {
          // Mostrar cambios solo si no se ha mostrado antes
          const key = `changelog_shown_${data.version}`;
          if (!localStorage.getItem(key)) {
            setShowChanges(true);
            localStorage.setItem(key, '1');
          }
        }
      });
  }, []);

  let appNameColor = 'text-electric-sky text-glow-electric-sky';
  let color = '#00B5FF';
  if (location.pathname.startsWith('/anime/')) {
    appNameColor = 'text-magenta-pink text-glow-magenta-pink';
    color = '#D93BDD';
  } else if (location.pathname.startsWith('/movie/')) {
    appNameColor = 'text-fuchsia-pink text-glow-fuchsia-pink';
    color = '#FF3B9A';
  }

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Películas', href: '/peliculas', icon: Film },
    { name: 'Series', href: '/series', icon: Clapperboard },
  ];

  // Modal de actualización
  const UpdateModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-dark-gray rounded-lg shadow-lg p-6 max-w-md w-full relative border-2 border-neon-cyan">
        <button
          onClick={() => { setShowUpdate(false); setShowUpdateButton(true); }}
          className="absolute top-2 right-2 text-neon-cyan hover:text-space-black hover:bg-neon-cyan rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-neon-cyan text-glow-cyan font-orbitron mb-4">Nueva versión disponible</h2>
        <p className="mb-2 text-gray-light">Tu versión: <b>{updateInfo?.version}</b></p>
        <p className="mb-4 text-gray-light">Última versión: <b>{updateInfo?.latest_version}</b></p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              setShowUpdate(false);
              setShowUpdateButton(true);
              if (updateInfo?.latest_version) {
                localStorage.setItem(`update_ignored_${updateInfo.latest_version}`, '1');
              }
            }}
            className="px-4 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Ignorar
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md bg-neon-cyan text-space-black font-bold hover:bg-cyan-400 transition-colors flex items-center"
          >
            Actualizar <Download className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );

  // Modal de cambios
  const ChangesModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-dark-gray rounded-lg shadow-lg p-6 max-w-2xl w-full relative border-2 border-neon-cyan overflow-y-auto max-h-[90vh]">
        <button
          onClick={() => setShowChanges(false)}
          className="absolute top-2 right-2 text-neon-cyan hover:text-space-black hover:bg-neon-cyan rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-neon-cyan text-glow-cyan font-orbitron mb-4">Novedades de la versión {updateInfo?.version}</h2>
        <div className="prose prose-invert max-w-none text-gray-light">
          <ReactMarkdown>{updateInfo?.changes || ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  );

  // Botón de update flotante
  const UpdateButton = () => (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed left-4 bottom-4 z-40 bg-neon-cyan text-space-black font-bold px-4 py-2 rounded-full shadow-lg flex items-center hover:bg-cyan-400 transition-colors"
    >
      {updateInfo?.latest_version} <Download className="ml-1 h-4 w-4" />
    </a>
  );

  return (
    <div className="min-h-screen bg-space-black text-ghost-white font-roboto">
      {showUpdate && <UpdateModal />}
      {showChanges && <ChangesModal />}
      {showUpdateButton && <UpdateButton />}
      {/* Header */}
      <header className="bg-dark-gray shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <img src="/icono.png" alt="Anxer Studios" className={`h-8 w-8 drop-shadow-[0_0_5px_${color}]`} />
              <span className={`text-xl font-bold font-orbitron ${appNameColor}`}>Anxer Studios</span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors font-orbitron ` +
                      (isActive
                        ? 'border-b-2 border-neon-cyan text-neon-cyan text-glow-cyan'
                        : 'text-gray-light hover:text-neon-cyan hover:text-glow-cyan')
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-light hover:text-neon-cyan hover:text-glow-cyan focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neon-cyan"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors font-orbitron ` +
                        (isActive
                          ? 'border-b-2 border-neon-cyan text-neon-cyan text-glow-cyan'
                          : 'text-gray-light hover:text-neon-cyan hover:text-glow-cyan')
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-gray border-t border-neon-cyan z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2">
              <Play className={`h-6 w-6 ${appNameColor}`} />
              <span className={`text-lg font-bold font-orbitron ${appNameColor}`}>Anxer Studios</span>
            </div>
            <p className="text-gray-light text-center">
              © 2025 Anxer Studios. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;