import { createContext, useContext, useEffect, useState } from 'react'

// ─── Contexto ─────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null)

// ─── Utilidades ───────────────────────────────────────────────────────────────
/**
 * Devuelve el tema guardado en localStorage, o la preferencia del SO, o 'dark'.
 */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage puede no estar disponible (modo privado muy restringido)
  }
  // Preferencia del sistema operativo
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  }
  return 'dark'
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  // Aplica la clase al <html> y persiste en localStorage
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    // Tailwind dark: también necesita la clase "dark" en <html>
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    try {
      localStorage.setItem('theme', theme)
    } catch {
      // silencioso
    }
  }, [theme])

  // Escucha cambios en la preferencia del SO mientras la app está abierta
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (e) => {
      // Solo actualiza si el usuario no ha elegido manualmente
      const saved = localStorage.getItem('theme')
      if (!saved) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook de consumo ───────────────────────────────────────────────────────────
export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext debe usarse dentro de <ThemeProvider>')
  }
  return ctx
}
