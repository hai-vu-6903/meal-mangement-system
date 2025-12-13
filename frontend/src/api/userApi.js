import axiosClient from './axiosClient'

const userApi = {
  getAll: (params) => {
    return axiosClient.get('/users', { params })
  },

  getDashboardStats: () => {
    return axiosClient.get('/users/dashboard-stats')
  },

  getById: (id) => {
    return axiosClient.get(`/users/${id}`)
  },

  create: (data) => {
    return axiosClient.post('/users', data)
  },

  update: (id, data) => {
    return axiosClient.put(`/users/${id}`, data)
  },

  delete: (id) => {
    return axiosClient.delete(`/users/${id}`)
  },

  resetPassword: (id, newPassword) => {
    return axiosClient.post(`/users/${id}/reset-password`, { new_password: newPassword })
  }
}

export default userApi