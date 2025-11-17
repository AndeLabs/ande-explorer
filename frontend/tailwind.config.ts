import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Base CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // ANDE Institutional Colors - Primary
        primary: {
          DEFAULT: '#2455B8', // Azul Profundo
          foreground: '#ffffff',
          50: '#eef3fc',
          100: '#d4e2f7',
          200: '#a9c5ef',
          300: '#7ea8e7',
          400: '#538bdf',
          500: '#2455B8', // Main
          600: '#1d4493',
          700: '#16336e',
          800: '#0f2249',
          900: '#081124',
        },
        
        // ANDE Institutional Colors - Secondary (Orange)
        secondary: {
          DEFAULT: '#FF9F1C', // Naranja Vibrante
          foreground: '#ffffff',
          50: '#fff8ed',
          100: '#ffebc9',
          200: '#ffd78a',
          300: '#ffc34b',
          400: '#FF9F1C', // Main
          500: '#e68a10',
          600: '#cc7509',
          700: '#995808',
          800: '#663b05',
          900: '#331d03',
        },
        
        // ANDE Institutional Colors - Tertiary (Lavender)
        lavender: {
          DEFAULT: '#BFA4FF', // Lavanda suave
          foreground: '#1f1f1f',
          50: '#f9f6ff',
          100: '#f0e9ff',
          200: '#e1d3ff',
          300: '#d2bdff',
          400: '#BFA4FF', // Main
          500: '#a885ff',
          600: '#8f66ff',
          700: '#7647ff',
          800: '#5d28ff',
          900: '#4409ff',
        },
        
        // ANDE Institutional Colors - Peach
        peach: {
          DEFAULT: '#FFC77D', // Durazno claro
          foreground: '#1f1f1f',
          50: '#fffaf2',
          100: '#fff1db',
          200: '#ffe3b7',
          300: '#ffd593',
          400: '#FFC77D', // Main
          500: '#ffb85f',
          600: '#ffa941',
          700: '#ff9a23',
          800: '#ff8b05',
          900: '#e67c00',
        },
        
        // Neutral Colors - ANDE
        neutral: {
          light: '#F4F4F4', // Gris Claro
          medium: '#9A9A9A', // Gris Medio
          dark: '#393939', // Gris Oscuro
        },
        
        // Semantic colors
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#FF9F1C', // Using ANDE Orange
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#F4F4F4', // Using ANDE Light Gray
          foreground: '#393939', // Using ANDE Dark Gray
        },
        accent: {
          DEFAULT: '#BFA4FF', // Using ANDE Lavender
          foreground: '#1f1f1f',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
