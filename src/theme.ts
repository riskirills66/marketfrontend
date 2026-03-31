/// <reference types="vite/client" />

// Theme configuration based on environment variables
// All VITE_ prefixed env vars are exposed to client-side code by Vite

export const theme = {
  // Primary brand colors
  primary: import.meta.env.VITE_PRIMARY_COLOR || '#0ea5e9',
  secondary: import.meta.env.VITE_SECONDARY_COLOR || '#06b6d4',
  accent: import.meta.env.VITE_ACCENT_COLOR || '#8b5cf6',
  
  // Semantic colors
  promo: import.meta.env.VITE_PROMO_COLOR || '#ff4757',
  success: import.meta.env.VITE_SUCCESS_COLOR || '#52c41a',
  warning: import.meta.env.VITE_WARNING_COLOR || '#faad14',
  error: import.meta.env.VITE_ERROR_COLOR || '#ff4d4f',
  
  // Neutral colors
  textPrimary: import.meta.env.VITE_TEXT_PRIMARY || '#1a1a1a',
  textSecondary: import.meta.env.VITE_TEXT_SECONDARY || '#64748b',
  background: import.meta.env.VITE_BACKGROUND_COLOR || '#fafbfc',
  surface: import.meta.env.VITE_SURFACE_COLOR || '#ffffff',
  border: import.meta.env.VITE_BORDER_COLOR || '#e1e8ed',
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '14, 165, 233';
}

// Helper function to inject theme CSS variables into document
export function injectThemeCSS() {
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-promo', theme.promo);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
  root.style.setProperty('--color-error', theme.error);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-border', theme.border);
  
  // Also inject RGB versions for rgba() usage
  root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primary));
  root.style.setProperty('--color-promo-rgb', hexToRgb(theme.promo));
  
  // Glassmorphism variables
  root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
  root.style.setProperty('--glass-bg-dark', 'rgba(255, 255, 255, 0.5)');
  root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.3)');
  root.style.setProperty('--glass-shadow', '0 8px 32px rgba(0, 0, 0, 0.1)');
  root.style.setProperty('--glass-blur', '20px');
  
  // Subtle background gradient based on primary color (very subtle)
  const primaryRgb = hexToRgb(theme.primary);
  root.style.setProperty('--bg-gradient-light', `rgba(${primaryRgb}, 0.02)`);
  root.style.setProperty('--bg-gradient-medium', `rgba(${primaryRgb}, 0.05)`);
}

// Ant Design theme configuration for glassmorphism
export const antdTheme = {
  token: {
    colorPrimary: theme.primary,
    colorSuccess: theme.success,
    colorWarning: theme.warning,
    colorError: theme.error,
    colorInfo: theme.secondary,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Modal: {
      contentBg: 'rgba(255, 255, 255, 0.85)',
      headerBg: 'rgba(255, 255, 255, 0.85)',
    },
    Card: {
      colorBgContainer: 'rgba(255, 255, 255, 0.7)',
    },
    Drawer: {
      colorBgElevated: 'rgba(255, 255, 255, 0.85)',
    },
    Dropdown: {
      colorBgElevated: 'rgba(255, 255, 255, 0.85)',
    },
    Menu: {
      colorBgContainer: 'transparent',
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.6)',
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.6)',
    },
    Button: {
      colorBgContainer: 'rgba(255, 255, 255, 0.6)',
    },
  },
};

export default theme;
