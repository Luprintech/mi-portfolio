import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" /></div>}>
        <App />
      </Suspense>
    </HelmetProvider>
  </StrictMode>,
)
