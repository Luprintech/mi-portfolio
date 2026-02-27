import './index.css'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {/* El color de fondo y texto se controlan por variables CSS en :root[data-theme] */}
        <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
          <Navbar />

          <main id="main-content" className="flex-1" role="main" aria-label="Contenido principal">
            <AppRoutes />
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
