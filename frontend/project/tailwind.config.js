/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',    // Móviles muy pequeños
        'sm': '640px',    // Móviles estándar
        'md': '768px',    // Tablets
        'lg': '1024px',   // Laptops
        'xl': '1280px',   // Desktops
        '2xl': '1536px',  // TVs y pantallas grandes
        '3xl': '1920px',  // TVs 4K o pantallas ultra anchas
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }], // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }], // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      colors: {
        'space-black': '#0A0A0A',
        'dark-gray': '#1A1A1A',
        'neon-cyan': '#00FFFF',
        'neon-magenta': '#FF00FF',
        'ghost-white': '#F8F8FF',
        'gray-light': '#A9A9A9',
        'electric-sky': '#00B5FF',
        'violet-blue': '#3D5BFF',
        'deep-purple': '#8E3BFF',
        'magenta-pink': '#D93BDD',
        'fuchsia-pink': '#FF3B9A',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
