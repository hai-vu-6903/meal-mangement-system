import axiosClient from './axiosClient'

const configApi = {
  getAll: () => {
    return axiosClient.get('/config')
  },

  getSystemSettings: () => {
    return axiosClient.get('/config/system')
  },

  update: (key, value, description) => {
    return axiosClient.put('/config', { key, value, description })
  },

  getMealConfigs: () => {
    return axiosClient.get('/config/meals')
  },

  createMeal: (data) => {
    return axiosClient.post('/config/meals', data)
  },

  updateMeal: (id, data) => {
    return axiosClient.put(`/config/meals/${id}`, data)
  },

  deleteMeal: (id) => {
    return axiosClient.delete(`/config/meals/${id}`)
  }
}

export default configApi