import React from 'react'
import { Moon, Sun, Settings, Zap } from 'lucide-react'

interface HeaderProps {
  darkMode: boolean
  toggleDarkMode: () => void
  currentView: 'mermaid' | 'yang'
  setCurrentView: (view: 'mermaid' | 'yang') => void
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  toggleDarkMode,
  currentView,
  setCurrentView
}) => {
  return (
    <header className="h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-6 shadow-sm">
      {/* Logo and Navigation */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <img
            src="/moe-logo.png"
            alt="Moe Logo"
            className="w-10 h-10 rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
              Mermaid & YANG Visualizer
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
              Network Model Analysis Tool
            </p>
          </div>
        </div>

        <nav className="flex space-x-1">
          <button
            onClick={() => setCurrentView('mermaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'mermaid'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
            }`}
          >
            Mermaid Viewer
          </button>
          <button
            onClick={() => setCurrentView('yang')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'yang'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
            }`}
          >
            YANG Explorer
          </button>
        </nav>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </header>
  )
}

export default Header