import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { loadThemeFromAPI } from './theme.ts'
import './glassmorphism.css'

// Load theme from API and render app
loadThemeFromAPI().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})