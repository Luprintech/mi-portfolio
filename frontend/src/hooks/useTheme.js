import { useThemeContext } from '../context/ThemeContext'

/**
 * Hook de conveniencia para consumir el tema desde cualquier componente.
 *
 * @returns {{ theme: 'dark'|'light', toggleTheme: () => void, isDark: boolean }}
 *
 * Ejemplo de uso:
 *   const { theme, toggleTheme, isDark } = useTheme()
 */
export function useTheme() {
    return useThemeContext()
}
