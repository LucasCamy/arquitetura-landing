import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/newsreader/opsz-italic.css'
import '@fontsource-variable/hanken-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/globals.css'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root ausente')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
