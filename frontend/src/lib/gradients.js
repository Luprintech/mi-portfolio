// Gradient Library - Colecciones de gradientes predefinidos

export const GRADIENT_PRESETS = {
  sunset: {
    name: 'Sunset',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ee5a6f 100%)',
    colors: ['#ff6b6b', '#feca57', '#ee5a6f'],
  },
  ocean: {
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: ['#667eea', '#764ba2'],
  },
  forest: {
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    colors: ['#11998e', '#38ef7d'],
  },
  neon: {
    name: 'Neon',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    colors: ['#f093fb', '#f5576c'],
  },
  aurora: {
    name: 'Aurora',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    colors: ['#a8edea', '#fed6e3'],
  },
  cosmic: {
    name: 'Cosmic',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    colors: ['#fa709a', '#fee140'],
  },
  ice: {
    name: 'Ice',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    colors: ['#a1c4fd', '#c2e9fb'],
  },
  fire: {
    name: 'Fire',
    gradient: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
    colors: ['#f83600', '#f9d423'],
  },
  purple: {
    name: 'Purple Dream',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    colors: ['#a855f7', '#ec4899'],
  },
  cyber: {
    name: 'Cyberpunk',
    gradient: 'linear-gradient(135deg, #e879f9 0%, #22d3ee 100%)',
    colors: ['#e879f9', '#22d3ee'],
  },
  gold: {
    name: 'Golden',
    gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    colors: ['#f7971e', '#ffd200'],
  },
  miami: {
    name: 'Miami',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    colors: ['#4facfe', '#00f2fe'],
  },
};

export const GRADIENT_ANIMATIONS = {
  none: 'none',
  shimmer: 'shimmer 3s ease-in-out infinite',
  wave: 'wave 4s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite',
};

export function getGradientPreset(presetName) {
  return GRADIENT_PRESETS[presetName] || GRADIENT_PRESETS.cyber;
}

export function getGradientsList() {
  return Object.entries(GRADIENT_PRESETS).map(([key, gradient]) => ({
    value: key,
    label: gradient.name,
    preview: gradient.gradient,
  }));
}

export function createCustomGradient(colors, angle = 135) {
  if (!colors || colors.length < 2) return GRADIENT_PRESETS.cyber.gradient;
  
  const colorStops = colors.map((color, index) => {
    const position = (index / (colors.length - 1)) * 100;
    return `${color} ${position}%`;
  }).join(', ');
  
  return `linear-gradient(${angle}deg, ${colorStops})`;
}
