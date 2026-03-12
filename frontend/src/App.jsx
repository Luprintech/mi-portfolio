import { lazy, Suspense, useEffect, useState } from 'react'
import './index.css'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import CookieBanner from './components/CookieBanner'

const ChatBot = lazy(() => import('./components/ChatBot'))

// Componente interno que puede usar useLocation (dentro de BrowserRouter)
function AppContent() {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/bitacora');
  const [shouldLoadChatBot, setShouldLoadChatBot] = useState(false);

  useEffect(() => {
    if (isCms) {
      setShouldLoadChatBot(false);
      return;
    }

    let timeoutId = null;
    let idleId = null;

    const enableChatBot = () => setShouldLoadChatBot(true);

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableChatBot, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(enableChatBot, 1800);
    }

    window.addEventListener('pointerdown', enableChatBot, { once: true });
    window.addEventListener('keydown', enableChatBot, { once: true });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId) window.cancelIdleCallback(idleId);
      window.removeEventListener('pointerdown', enableChatBot);
      window.removeEventListener('keydown', enableChatBot);
    };
  }, [isCms]);

  // El CMS tiene su propio layout completo, sin Navbar/Footer/ChatBot del portfolio
  if (isCms) {
    return (
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Navbar />
        <main id="main-content" className="flex-1" role="main" aria-label="Contenido principal">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      {shouldLoadChatBot && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
      <CookieBanner />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
