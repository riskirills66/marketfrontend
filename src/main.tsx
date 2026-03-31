import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { injectThemeCSS } from './theme.ts'

// Inject theme colors from environment variables
injectThemeCSS()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)