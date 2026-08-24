import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { HouseProvider } from './context/HouseContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HouseProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </HouseProvider>
    </BrowserRouter>
  </StrictMode>,
)
