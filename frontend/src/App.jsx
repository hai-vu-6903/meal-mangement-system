// App.jsx
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { router } from './router'
import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  )
}

export default App