// Layout.jsx
import React, { useState } from 'react'
import Header from '../Header'
import Sidebar from '../Sidebar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex pt-16"> {/* Thêm pt-16 để tránh bị header che */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className={`flex-1 transition-all duration-300
          ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0 lg:ml-0'}`}>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout