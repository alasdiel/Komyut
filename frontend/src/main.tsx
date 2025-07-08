import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router.tsx'
import PingThrobber from "@/components/loading/Throbber";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PingThrobber />
    <AppRouter />
  </StrictMode>,
)
