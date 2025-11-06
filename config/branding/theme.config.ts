/**
 * Ande Explorer Theme Configuration
 * Standard branding settings for both main and advanced instances
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    fontFamily: {
      primary: string;
      monospace: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Ande Network Brand Colors
const ANDE_COLORS = {
  primary: '#2563eb',    // Blue-600
  secondary: '#1e40af',  // Blue-800
  accent: '#3b82f6',     // Blue-500
  background: '#ffffff',
  surface: '#f8fafc',    // Slate-50
  text: {
    primary: '#1e293b',   // Slate-800
    secondary: '#64748b', // Slate-500
    inverse: '#ffffff',
  },
  status: {
    success: '#10b981',   // Emerald-500
    warning: '#f59e0b',   // Amber-500
    error: '#ef4444',     // Red-500
    info: '#06b6d4',      // Cyan-500
  },
} as const;

export const ANDE_THEME: ThemeConfig = {
  colors: ANDE_COLORS,
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      monospace: 'JetBrains Mono, Fira Code, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

// Dark theme variant
export const ANDE_DARK_THEME: ThemeConfig = {
  ...ANDE_THEME,
  colors: {
    ...ANDE_COLORS,
    background: '#0f172a',    // Slate-900
    surface: '#1e293b',      // Slate-800
    text: {
      primary: '#f1f5f9',    // Slate-100
      secondary: '#94a3b8',  // Slate-400
      inverse: '#0f172a',    // Slate-900
    },
  },
};

// Advanced analytics theme (slightly different accent colors)
export const ANDE_ADVANCED_THEME: ThemeConfig = {
  ...ANDE_THEME,
  colors: {
    ...ANDE_COLORS,
    primary: '#7c3aed',     // Violet-600
    secondary: '#6d28d9',    // Violet-800
    accent: '#8b5cf6',       // Violet-500
  },
};

// Advanced dark theme
export const ANDE_ADVANCED_DARK_THEME: ThemeConfig = {
  ...ANDE_DARK_THEME,
  colors: {
    ...ANDE_DARK_THEME.colors,
    primary: '#7c3aed',     // Violet-600
    secondary: '#6d28d9',    // Violet-800
    accent: '#8b5cf6',       // Violet-500
  },
};

// Theme utilities
export const getTheme = (instance: 'main' | 'advanced', mode: 'light' | 'dark' = 'light'): ThemeConfig => {
  const themes = {
    main: {
      light: ANDE_THEME,
      dark: ANDE_DARK_THEME,
    },
    advanced: {
      light: ANDE_ADVANCED_THEME,
      dark: ANDE_ADVANCED_DARK_THEME,
    },
  };
  
  return themes[instance][mode];
};

// CSS custom properties generator
export const generateCSSVariables = (theme: ThemeConfig): string => {
  return `
    :root {
      /* Colors */
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text-primary: ${theme.colors.text.primary};
      --color-text-secondary: ${theme.colors.text.secondary};
      --color-text-inverse: ${theme.colors.text.inverse};
      --color-success: ${theme.colors.status.success};
      --color-warning: ${theme.colors.status.warning};
      --color-error: ${theme.colors.status.error};
      --color-info: ${theme.colors.status.info};
      
      /* Typography */
      --font-primary: ${theme.typography.fontFamily.primary};
      --font-monospace: ${theme.typography.fontFamily.monospace};
      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      --font-size-3xl: ${theme.typography.fontSize['3xl']};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      --spacing-2xl: ${theme.spacing['2xl']};
      
      /* Border Radius */
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      --radius-full: ${theme.borderRadius.full};
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      
      /* Breakpoints */
      --breakpoint-mobile: ${theme.breakpoints.mobile};
      --breakpoint-tablet: ${theme.breakpoints.tablet};
      --breakpoint-desktop: ${theme.breakpoints.desktop};
    }
  `;
};

export default ANDE_THEME;