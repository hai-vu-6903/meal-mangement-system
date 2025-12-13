import axiosClient from './axiosClient'

const unitApi = {
  getAll: () => {
    return axiosClient.get('/units')
  },

  getById: (id) => {
    return axiosClient.get(`/units/${id}`)
  },

  create: (data) => {
    return axiosClient.post('/units', data)
  },

  update: (id, data) => {
    return axiosClient.put(`/units/${id}`, data)
  },

  delete: (id) => {
    return axiosClient.delete(`/units/${id}`)
  }
}

export default unitApi