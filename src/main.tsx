import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/config/env'
import { initErrorMonitoring } from './shared/monitoring/errorMonitoring'
import './index.css'
import App from './App.tsx'

initErrorMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
