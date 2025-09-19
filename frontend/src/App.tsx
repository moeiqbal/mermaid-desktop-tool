import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MermaidViewer from './views/MermaidViewer'
import DocumentView from './views/DocumentView'
import YangExplorer from './views/YangExplorer'
import FullScreenDiagram from './components/FullScreenDiagram'
import ErrorBoundary from './components/ErrorBoundary'
import { NotificationProvider } from './components/NotificationSystem'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [currentView, setCurrentView] = useState<'mermaid' | 'document' | 'yang'>('mermaid')

  // Apply theme on mount and changes
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleError = (error: Error, errorInfo: any) => {
    // Log error to monitoring service in production
    console.error('Application error:', error, errorInfo)

    // In production, you might send this to your error tracking service
    // e.g., Sentry, Bugsnag, etc.
  }

  return (
    <ErrorBoundary onError={handleError}>
      <NotificationProvider>
        <Router>
          <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
              <Header
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                currentView={currentView}
                setCurrentView={setCurrentView}
              />

              <main className="h-[calc(100vh-64px)]">
                <ErrorBoundary>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <div className="fade-in">
                          {currentView === 'mermaid' ? <MermaidViewer /> :
                           currentView === 'document' ? <DocumentView /> :
                           <YangExplorer />}
                        </div>
                      }
                    />
                    <Route
                      path="/mermaid"
                      element={
                        <div className="fade-in">
                          <MermaidViewer />
                        </div>
                      }
                    />
                    <Route
                      path="/document"
                      element={
                        <div className="fade-in">
                          <DocumentView />
                        </div>
                      }
                    />
                    <Route
                      path="/yang"
                      element={
                        <div className="fade-in">
                          <YangExplorer />
                        </div>
                      }
                    />
                    <Route
                      path="/diagram/:fileId/:diagramIndex"
                      element={<FullScreenDiagram />}
                    />
                  </Routes>
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App