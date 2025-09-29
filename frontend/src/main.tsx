import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import BrowserCompatibilityCheck from './components/BrowserCompatibilityCheck.tsx'
import './styles/index.css'
import './styles/theme-toggle.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserCompatibilityCheck>
    <App />
  </BrowserCompatibilityCheck>,
)