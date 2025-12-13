import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaTachometerAlt,
  FaUsers,
  FaUtensils,
  FaChartBar,
  FaBuilding,
  FaCalendarAlt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaTimes
} from 'react-icons/fa'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const sidebarRef = useRef(null)
  const [collapsed, setCollapsed] = useState(false)

  // Tự động đóng sidebar trên mobile khi chuyển trang
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [location.pathname])

  // Click outside để đóng sidebar trên mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const adminMenu = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'Quản lý người dùng' },
    { path: '/admin/meals', icon: FaUtensils, label: 'Quản lý suất ăn' },
    { path: '/admin/stats', icon: FaChartBar, label: 'Thống kê & Báo cáo' },
    { path: '/admin/units', icon: FaBuilding, label: 'Quản lý đơn vị' },
    { path: '/admin/config', icon: FaCog, label: 'Cấu hình hệ thống' },
  ]

  const soldierMenu = [
    { path: '/soldier', icon: FaCalendarAlt, label: 'Đăng ký suất ăn' },
    { path: '/soldier/profile', icon: FaUser, label: 'Hồ sơ cá nhân' },
  ]

  const menu = user?.role === 'admin' ? adminMenu : soldierMenu

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:relative h-screen bg-white border-r border-gray-200 z-30 transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-64'}`}
        style={{ top: 0, height: '100vh' }}
      >
        <div className="h-full flex flex-col">
          {/* LOGO */}
          <div className="h-16 p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <FaHome className="text-white" />
              </div>

              {!collapsed && (
                <div>
                  <h3 className="font-bold text-gray-800">Menu</h3>
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Quản trị' : 'Quân nhân'}</p>
                </div>
              )}
            </div>

            {/* Close button mobile và collapse button desktop */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Đóng menu"
              >
                <FaTimes />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100"
                aria-label={collapsed ? "Mở rộng menu" : "Thu nhỏ menu"}
              >
                <svg
                  className={`w-4 h-4 text-gray-500 transform ${collapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* MENU ITEMS */}
          <nav className="flex-grow overflow-y-auto py-4 px-2 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center py-3 rounded-lg group relative transition-all
                     ${collapsed ? 'justify-center px-3' : 'px-4'}
                     ${isActive
                       ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                       : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                     }`
                  }
                >
                  <Icon className={`${collapsed ? 'text-xl' : 'mr-3'} transition-transform group-hover:scale-110`} />

                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}

                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                                    px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 invisible
                                    group-hover:opacity-100 group-hover:visible transition-all shadow-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* USER + LOGOUT */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">{user?.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.military_code}</p>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className={`mt-4 flex items-center w-full py-2 text-red-600 hover:bg-red-50 rounded-lg
                ${collapsed ? 'justify-center px-3' : 'px-4'}`}
              aria-label="Đăng xuất"
            >
              <FaSignOutAlt className={`${collapsed ? 'text-lg' : 'mr-3'}`} />
              {!collapsed && <span>Đăng xuất</span>}
            </button>

            {!collapsed && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border">
                <strong>Lưu ý:</strong> Hệ thống đóng lúc 18:00 hàng ngày
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar