
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Navbar />

        <main className="flex-1">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
