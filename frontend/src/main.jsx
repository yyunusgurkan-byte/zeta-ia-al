import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initSEO } from './seo.js'
initSEO()
import { initSearchConsole } from './searchConsole.js'
initSearchConsole()
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)