import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import './style.css'

// Initialize Firebase
import { initializeFirebase } from './config/firebase'
initializeFirebase()

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

