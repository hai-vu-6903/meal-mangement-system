import axiosClient from './axiosClient'

const authApi = {
  login: (military_code, password) => {
    return axiosClient.post('/auth/login', { military_code, password })
  },

  logout: () => {
    // Gọi API logout nếu backend có endpoint
    return axiosClient.post('/auth/logout')
  },

  getProfile: () => {
    return axiosClient.get('/auth/profile')
  },

  updateProfile: (data) => {
    return axiosClient.put('/auth/profile', data)
  },

  changePassword: (oldPassword, newPassword) => {
    return axiosClient.post('/auth/change-password', { oldPassword, newPassword })
  },

  // Optional: refresh token
  refreshToken: () => {
    return axiosClient.post('/auth/refresh-token')
  },

  // Optional: check token validity
  validateToken: () => {
    return axiosClient.get('/auth/validate-token')
  }
}

export default authApi