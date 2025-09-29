/**
 * Mermaid Theme Configuration
 * Defines multiple color schemes for better diagram visibility
 */

export interface MermaidThemeConfig {
  name: string;
  displayName: string;
  mermaidTheme: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  backgroundColor: string;
  description: string;
}

export const MERMAID_THEMES: Record<string, MermaidThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    mermaidTheme: 'default',
    backgroundColor: '#ffffff',
    description: 'Light theme with white background (Default)'
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    mermaidTheme: 'dark',
    backgroundColor: '#1e1e1e',
    description: 'Dark theme for low-light environments'
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    mermaidTheme: 'forest',
    backgroundColor: '#f4f4f4',
    description: 'Forest theme with green accents'
  },
  neutral: {
    name: 'neutral',
    displayName: 'Neutral',
    mermaidTheme: 'neutral',
    backgroundColor: '#f9f9f9',
    description: 'Neutral theme with muted colors'
  },
  highContrast: {
    name: 'highContrast',
    displayName: 'High Contrast',
    mermaidTheme: 'base',
    backgroundColor: '#ffffff',
    description: 'High contrast theme for better accessibility'
  }
};

export const DEFAULT_THEME = 'light';

/**
 * Get theme configuration by name
 */
export function getTheme(themeName: string): MermaidThemeConfig {
  return MERMAID_THEMES[themeName] || MERMAID_THEMES[DEFAULT_THEME];
}

/**
 * Get all available theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(MERMAID_THEMES);
}

/**
 * Load theme preference from localStorage
 */
export function loadThemePreference(): string {
  try {
    return localStorage.getItem('mermaid-theme') || DEFAULT_THEME;
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(themeName: string): void {
  try {
    localStorage.setItem('mermaid-theme', themeName);
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}