import React from 'react';
import { MERMAID_THEMES, type MermaidThemeConfig } from '../themes/mermaidThemes';

interface ThemeToggleProps {
  currentTheme: string;
  onThemeChange: (themeName: string) => void;
  className?: string;
}

/**
 * Theme Toggle Component
 * Provides a dropdown for switching between Mermaid diagram themes
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  currentTheme,
  onThemeChange,
  className = ''
}) => {
  const themes = Object.values(MERMAID_THEMES);
  const selectedTheme = MERMAID_THEMES[currentTheme];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(event.target.value);
  };

  return (
    <div className={`theme-toggle ${className}`} data-testid="theme-toggle" data-theme={currentTheme}>
      <label htmlFor="theme-select" className="theme-toggle-label">
        <span className="theme-icon" aria-hidden="true">🎨</span>
        <span className="theme-label-text">Theme:</span>
      </label>
      <select
        id="theme-select"
        value={currentTheme}
        onChange={handleChange}
        className="theme-select"
        aria-label="Select diagram theme"
        data-testid="theme-select"
      >
        {themes.map((theme: MermaidThemeConfig) => (
          <option key={theme.name} value={theme.name}>
            {theme.displayName}
          </option>
        ))}
      </select>
      {selectedTheme && (
        <span className="theme-description" title={selectedTheme.description}>
          {selectedTheme.description}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;