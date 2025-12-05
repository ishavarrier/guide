/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './utils/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Warm tan (#E2A16F)
        primary: '#E2A16F',
        'primary-foreground': '#ffffff',
        // Secondary brand color - Muted blue (#86B0BD)
        secondary: '#86B0BD',
        'secondary-foreground': '#ffffff',
        // Background - Cream (#FFF0DD)
        background: '#FFF0DD',
        // Foreground text - Dark gray for readability
        foreground: '#1e293b',
        // Card - White for contrast on cream background
        card: '#ffffff',
        'card-foreground': '#1e293b',
        popover: '#ffffff',
        'popover-foreground': '#1e293b',
        // Muted - Light gray (#D1D3D4)
        muted: '#D1D3D4',
        'muted-foreground': '#64748b',
        // Accent - Muted blue (#86B0BD)
        accent: '#86B0BD',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        // Border - Light gray (#D1D3D4)
        border: '#D1D3D4',
        input: 'transparent',
        'input-background': '#ffffff',
        // Ring - Primary tan for focus states
        ring: '#E2A16F',
        chart: {
          '1': '#E2A16F',  // Tan
          '2': '#86B0BD',  // Blue
          '3': '#D1D3D4',  // Gray
          '4': '#FFF0DD',  // Cream
          '5': '#1e293b',  // Dark gray
        },
      },
      borderRadius: {
        lg: '0.625rem',
        md: 'calc(0.625rem - 2px)',
        sm: 'calc(0.625rem - 4px)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
};
