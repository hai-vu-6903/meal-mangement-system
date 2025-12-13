import React, { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import authApi from '../api/authApi'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logoutTimer, setLogoutTimer] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(userData))
          startLogoutTimer()  // auto logout nếu reload trang
        } else {
          clearAuthData()
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        clearAuthData()
      }
    }
    setLoading(false)
  }

  const clearAuthData = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    if (logoutTimer) clearTimeout(logoutTimer)

    setUser(null)
  }

  const login = async (militaryCode, password) => {
    try {
      const response = await authApi.login(militaryCode, password)

      if (response.success) {
        const { token, user } = response.data

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)

        startLogoutTimer()

        return { success: true, user }
      }

      return { success: false, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      }
    }
  }

  const startLogoutTimer = () => {
    // clear timer cũ
    if (logoutTimer) clearTimeout(logoutTimer)

    const timer = setTimeout(() => {
      toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
      logout()
    }, 8 * 60 * 60 * 1000) // 8 giờ

    setLogoutTimer(timer)
  }

  const resetLogoutTimer = () => {
    startLogoutTimer()
  }

  useEffect(() => {
    if (user) {
      startLogoutTimer()

      const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
      const reset = () => resetLogoutTimer()

      events.forEach(ev => window.addEventListener(ev, reset))

      return () => {
        events.forEach(ev => window.removeEventListener(ev, reset))
        if (logoutTimer) clearTimeout(logoutTimer)
      }
    }
  }, [user])

  const logout = async () => {
    try {
      await authApi.logout() // Nếu backend không có thì vẫn chạy vào finally
    } catch (err) {
      console.log('Logout API error:', err)
    } finally {
      clearAuthData()
      window.location.href = '/login'
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateProfile(data)
      if (response.success) {
        const updatedUser = { ...user, ...data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      return response
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Cập nhật thất bại'
      }
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await authApi.changePassword(oldPassword, newPassword)
      return response
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại'
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateProfile,
      changePassword,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSoldier: user?.role === 'soldier'
    }}>
      {children}
    </AuthContext.Provider>
  )
}
