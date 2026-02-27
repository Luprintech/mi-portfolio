import './index.css'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
          <Navbar />

          <main id="main-content" className="flex-1" role="main" aria-label="Contenido principal">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
