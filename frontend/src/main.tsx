import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './App.tsx'
import './assets/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)
