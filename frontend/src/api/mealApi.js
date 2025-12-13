import axiosClient from './axiosClient'

const mealApi = {
  // Lấy tất cả bữa ăn
  getAll: () => {
    return axiosClient.get('/meals')
  },

  // Lấy bữa ăn theo ID
  getById: (id) => {
    return axiosClient.get(`/meals/${id}`)
  },

  // Tạo bữa ăn mới (admin only)
  create: (data) => {
    return axiosClient.post('/meals', data)
  },

  // Cập nhật bữa ăn (admin only)
  update: (id, data) => {
    return axiosClient.put(`/meals/${id}`, data)
  },

  // Xóa bữa ăn (admin only)
  delete: (id) => {
    return axiosClient.delete(`/meals/${id}`)
  },

  //Lấy danh sách bữa ăn đang hoạt động
  getActiveMeals: () => {
    return axiosClient.get('/meals/active')
  },

  // getActiveMeals: () => axiosClient.get('/meals/active'),

  getByDate: (date, filters = {}) => {
    return axiosClient.get(`/meals/date/${date}`, {
      params: {
        unit_id: filters.unit_id || '',
        meal_type: filters.meal_type || '',
        search: filters.search || ''
      }
    })
  },
}

export default mealApi