import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FireflyCursor } from './modules/cursor/FireflyCursor'

createRoot(document.getElementById('root')!).render(<StrictMode><App /><FireflyCursor /></StrictMode>)
