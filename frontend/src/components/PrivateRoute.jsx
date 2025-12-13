import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'

const PrivateRoute = ({ children, role }) => {
  const { user, loading, logout } = useAuth()
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const decoded = jwtDecode(token)
          const isExpired = decoded.exp * 1000 < Date.now()
          setTokenValid(!isExpired)
          
          if (isExpired) {
            // Tự động logout khi token hết hạn
            logout()
          }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          setTokenValid(false)
          logout()
        }
      } else {
        setTokenValid(false)
      }
    }

    checkTokenValidity()
    
    // Check token validity every minute
    const interval = setInterval(checkTokenValidity, 60000)
    return () => clearInterval(interval)
  }, [logout])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || !tokenValid) {
    return <Navigate to="/login" />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/soldier'} />
  }

  return children
}

export default PrivateRoute