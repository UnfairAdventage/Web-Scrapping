import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Play, Home, Menu, X, Clapperboard, Film } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
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

  return (
    <div className="min-h-screen bg-space-black text-ghost-white font-roboto">
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
      <footer className="bg-dark-gray border-t border-neon-cyan">
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