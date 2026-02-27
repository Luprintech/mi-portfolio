import { Component } from 'react';

/**
 * Error Boundary - captura errores no controlados en el árbol de componentes
 * y muestra una UI de recuperación en lugar de una pantalla blanca.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción podrías enviar esto a Sentry, LogRocket, etc.
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-4">
              ¡Ups!
            </p>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Algo salió mal
            </h1>
            <p className="text-[var(--text-muted)] mb-8 text-sm">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 transition-all duration-300"
              >
                Recargar
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 rounded-xl font-semibold text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary-dim)] transition-all duration-300"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
