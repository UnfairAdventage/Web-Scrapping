import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-space-black text-ghost-white">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 drop-shadow-[0_0_10px_#FF0000] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-500 drop-shadow-[0_0_10px_#FF0000] font-orbitron mb-2">¡Oops! Algo salió mal</h2>
            <p className="text-red-500 drop-shadow-[0_0_10px_#FF0000] font-orbitron mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-space-black border-2 border-red-500 drop-shadow-[0_0_10px_#FF0000] font-orbitron px-6 py-2 rounded-lg font-bold transition-colors shadow-md hover:bg-space-black hover:text-red-500 hover:text-glow-red hover:border-red-500"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;