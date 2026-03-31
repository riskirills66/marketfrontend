/// <reference types="vite/client" />

import { apiClient } from './api';
import type { SiteConfig } from './types';

// Default theme configuration (fallback)
const defaultTheme = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  accent: '#8b5cf6',
  promo: '#ff4757',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  textPrimary: '#1a1a1a',
  textSecondary: '#64748b',
  background: '#fafbfc',
  surface: '#ffffff',
  border: '#e1e8ed',
  faviconUrl: '/favicon.svg',
};

// Current theme (will be loaded from API)
export let theme = { ...defaultTheme };

// Load theme from API
export async function loadThemeFromAPI(): Promise<void> {
  try {
    const config = await apiClient.getSiteConfig();
    theme = {
      primary: config.primary_color,
      secondary: config.secondary_color,
      accent: config.accent_color,
      promo: config.promo_color,
      success: config.success_color,
      warning: config.warning_color,
      error: config.error_color,
      textPrimary: config.text_primary,
      textSecondary: config.text_secondary,
      background: config.background_color,
      surface: config.surface_color,
      border: config.border_color,
      faviconUrl: config.favicon_url,
    };
    
    // Update favicon
    updateFavicon(config.favicon_url);
    
    // Inject CSS variables
    injectThemeCSS();
  } catch (error) {
    console.error('Failed to load theme from API, using defaults:', error);
    // Use default theme if API fails
    theme = { ...defaultTheme };
    injectThemeCSS();
  }
}

// Update favicon dynamically
function updateFavicon(url: string) {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = url;
  document.head.appendChild(link);
}

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
