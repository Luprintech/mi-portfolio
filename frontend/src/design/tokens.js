// SISTEMA DE DISEÑO - DESIGN TOKENS
// Este archivo centraliza todos los valores de diseño del portfolio

// ===================================
// PALETA DE COLORES (Simplificada)
// ===================================

export const colors = {
    // Colores principales (solo 2)
    primary: {
        DEFAULT: '#ec4899',    // fuchsia-500
        light: '#f9a8d4',      // fuchsia-300
        dark: '#be185d',       // fuchsia-700
    },
    secondary: {
        DEFAULT: '#22d3ee',    // cyan-400
        light: '#67e8f9',      // cyan-300
        dark: '#0891b2',       // cyan-600
    },

    // Acento (usar con moderación)
    accent: {
        purple: '#a855f7',     // purple-500
        emerald: '#34d399',    // emerald-400
        yellow: '#fbbf24',     // yellow-400
    },

    // Backgrounds y superficies
    background: {
        primary: '#0b1120',    // Dark navy principal
        secondary: '#1a1f3b',  // Dark navy secundario
        card: 'rgba(30, 41, 59, 0.7)', // slate-800/70
    },

    // Textos
    text: {
        primary: '#f3f4f6',    // gray-100
        secondary: '#d1d5db',  // gray-300
        tertiary: '#9ca3af',   // gray-400
        muted: '#6b7280',      // gray-500
    },

    // Estados
    states: {
        hover: 'rgba(236, 72, 153, 0.1)',
        active: 'rgba(34, 211, 238, 0.1)',
    }
};

// ===================================
// ESPACIADO (8pt Grid System)
// ===================================

export const spacing = {
    // Solo usar estos valores para mantener consistencia
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
};

// Mapeo a clases Tailwind (referencia)
export const spacingClasses = {
    xs: 'gap-2 p-2',       // 8px
    sm: 'gap-3 p-3',       // 12px
    md: 'gap-4 p-4',       // 16px
    lg: 'gap-6 p-6',       // 24px
    xl: 'gap-8 p-8',       // 32px
    '2xl': 'gap-12 p-12',  // 48px
    '3xl': 'gap-16 p-16',  // 64px
};

// ===================================
// TIPOGRAFÍA
// ===================================

export const typography = {
    // Escala modular (proporción 1.25)
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
        '6xl': '3.75rem',  // 60px
        '7xl': '4.5rem',   // 72px
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },

    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    }
};

// ===================================
// SOMBRAS DE MARCA
// ===================================

export const shadows = {
    card: '0 4px 16px rgba(0, 0, 0, 0.12)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.16)',

    // Sombras con color de marca
    primary: '0 8px 32px rgba(236, 72, 153, 0.15)',
    primaryHover: '0 12px 40px rgba(236, 72, 153, 0.25)',

    secondary: '0 8px 32px rgba(34, 211, 238, 0.15)',
    secondaryHover: '0 12px 40px rgba(34, 211, 238, 0.25)',

    glow: '0 0 24px rgba(236, 72, 153, 0.3)',
    glowCyan: '0 0 24px rgba(34, 211, 238, 0.3)',
};

// ===================================
// TRANSICIONES
// ===================================

export const transitions = {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
};

// ===================================
// BREAKPOINTS
// ===================================

export const breakpoints = {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

// ===================================
// GRADIENTES DE MARCA
// ===================================

export const gradients = {
    primary: 'linear-gradient(135deg, #ec4899 0%, #22d3ee 100%)',
    primaryReverse: 'linear-gradient(135deg, #22d3ee 0%, #ec4899 100%)',
    text: 'linear-gradient(to right, #f9a8d4, #22d3ee)',
    hero: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.2), rgba(34, 211, 238, 0.1))',
};

// ===================================
// CLASES TAILWIND PREDEFINIDAS
// ===================================

// Para componentes reutilizables
export const classes = {
    // Botones
    button: {
        primary: 'px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-400 hover:to-cyan-300 text-white font-semibold shadow-lg hover:shadow-fuchsia-500/40 transition-all duration-300',
        secondary: 'px-6 py-3 rounded-xl border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400/10 hover:text-white font-semibold transition-all duration-300',
        ghost: 'px-6 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-semibold transition-all duration-300',
    },

    // Cards
    card: {
        base: 'bg-slate-800/70 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-700/50',
        hover: 'hover:shadow-fuchsia-600/20 transition-all duration-300',
        interactive: 'cursor-pointer hover:scale-102 hover:-translate-y-1',
    },

    // Inputs
    input: {
        base: 'w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all',
    },

    // Texto con gradiente
    textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400',
};

// ===================================
// ANIMACIONES
// ===================================

export const animations = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.6 }
    },

    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    },

    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    },

    scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4 }
    },
};

// ===================================
// RESPONSIVE HELPERS
// ===================================

export const responsive = {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 md:py-16 lg:py-24',
    sectionSmall: 'py-8 md:py-12',
};

export default {
    colors,
    spacing,
    typography,
    shadows,
    transitions,
    breakpoints,
    gradients,
    classes,
    animations,
    responsive,
};
