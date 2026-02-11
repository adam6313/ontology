import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import './demo' // Demo mode: mock API data. Uncomment to use mock data.
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
