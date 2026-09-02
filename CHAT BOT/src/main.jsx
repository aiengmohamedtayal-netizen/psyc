import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../style.css' // Import original stylesheet from parent directory

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
