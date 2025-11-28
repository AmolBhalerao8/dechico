import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import './style.css'

// Initialize Firebase
import { initializeFirebase } from './config/firebase'
import { API_BASE_URL } from './services/apiClient'
initializeFirebase()

console.log('[DeChico] API_BASE_URL =', API_BASE_URL)

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

