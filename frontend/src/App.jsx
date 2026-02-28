import './index.css'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ChatBot from './components/ChatBot'

// Componente interno que puede usar useLocation (dentro de BrowserRouter)
function AppContent() {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/bitacora');

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
      <ChatBot />
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
