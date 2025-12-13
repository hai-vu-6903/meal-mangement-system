import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaUserShield, FaLock } from 'react-icons/fa'

const Login = () => {
  const [militaryCode, setMilitaryCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(militaryCode, password)
      
      if (result.success) {
        toast.success('Đăng nhập thành công')
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/soldier')
        }
      } else {
        toast.error(result.message || 'Đăng nhập thất bại')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Lỗi kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              <FaUserShield className="text-5xl" />
            </div>
            <h1 className="text-2xl font-bold mb-2">HỆ THỐNG QUẢN LÝ SUẤT ĂN</h1>
            <p className="opacity-90">Quân đội nhân dân Việt Nam</p>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUserShield className="inline mr-2" />
                  Mã quân nhân
                </label>
                <input
                  type="text"
                  value={militaryCode}
                  onChange={(e) => setMilitaryCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="VD: QN001"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaLock className="inline mr-2" />
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'ĐĂNG NHẬP'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Tài khoản demo:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">ADMIN001 / admin123</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quân nhân:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">QN001 / 123456</code>
                </div>
              </div>
            </div> */}
            {/* Demo Credentials */}
<div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
  <h3 className="font-medium text-gray-700 mb-2">Tài khoản demo:</h3>
  <div className="flex gap-4">
    <button
      type="button"
      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      onClick={() => {
        setMilitaryCode('ADMIN001')
        setPassword('admin123')
      }}
    >
      Demo Admin
    </button>
    <button
      type="button"
      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      onClick={() => {
        setMilitaryCode('QN001')
        setPassword('123456')
      }}
    >
      Demo Soldier
    </button>
  </div>
</div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Bộ Quốc phòng. Phiên bản 1.0</p>
              <p className="mt-1">Hệ thống quản lý suất ăn quân nhân</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login