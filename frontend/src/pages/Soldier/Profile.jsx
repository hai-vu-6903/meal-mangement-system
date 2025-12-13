import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBuilding,
  FaShieldAlt,
  FaKey,
  FaSave,
  FaEdit
} from 'react-icons/fa'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    email: '',
    phone: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await updateProfile(profileForm)
      if (response.success) {
        toast.success('Cập nhật thông tin thành công')
        setEditMode(false)
      } else {
        toast.error(response.message || 'Cập nhật thất bại')
      }
    } catch (error) {
      toast.error('Lỗi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const response = await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      if (response.success) {
        toast.success('Đổi mật khẩu thành công')
        setChangePasswordMode(false)
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại')
      }
    } catch (error) {
      toast.error('Lỗi đổi mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  const getRoleName = (role) => {
    return role === 'admin' ? 'Quản trị viên' : 'Quân nhân'
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Thông tin và cài đặt tài khoản của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Thông tin cá nhân</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaUser className="mr-2" />
                        Họ tên
                      </label>
                      <input
                        type="text"
                        value={user?.full_name || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaIdCard className="mr-2" />
                        Mã quân nhân
                      </label>
                      <input
                        type="text"
                        value={user?.military_code || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaBuilding className="mr-2" />
                        Đơn vị
                      </label>
                      <input
                        type="text"
                        value={user?.unit_name || 'Chưa phân đơn vị'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaShieldAlt className="mr-2" />
                        Chức vụ
                      </label>
                      <input
                        type="text"
                        value={user?.position || '-'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaEnvelope className="mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaPhone className="mr-2" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Họ tên</label>
                      <p className="text-lg font-medium text-gray-800">{user?.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Mã quân nhân</label>
                      <p className="text-lg font-medium text-gray-800">{user?.military_code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.email || <span className="text-gray-400">Chưa cập nhật</span>}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Đơn vị</label>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.unit_name || 'Chưa phân đơn vị'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Chức vụ</label>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.position || <span className="text-gray-400">Chưa cập nhật</span>}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                      <p className="text-lg font-medium text-gray-800">
                        {user?.phone || <span className="text-gray-400">Chưa cập nhật</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vai trò</label>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      user?.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getRoleName(user?.role)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo tài khoản</label>
                    <p className="text-gray-800">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">Bảo mật</h3>
            </div>

            {changePasswordMode ? (
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setChangePasswordMode(false)
                        setPasswordForm({
                          oldPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang đổi...
                        </>
                      ) : (
                        <>
                          <FaKey className="mr-2" />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaKey className="text-2xl text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-6">Để bảo mật tài khoản, hãy thay đổi mật khẩu thường xuyên</p>
                  <button
                    onClick={() => setChangePasswordMode(true)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <FaKey className="mr-2" />
                    Đổi mật khẩu
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Lưu ý về mật khẩu:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                    <li>• Không chia sẻ mật khẩu với người khác</li>
                    <li>• Thay đổi mật khẩu 3 tháng một lần</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile