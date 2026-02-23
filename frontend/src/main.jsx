import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-cyan-400">Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
