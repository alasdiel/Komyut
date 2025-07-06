import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// #TODO: remove comment below once Router works well
// import App from './App.tsx'
import AppRouter from './router.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
