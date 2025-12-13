import axiosClient from './axiosClient'

const registerApi = {
  // Đăng ký suất ăn
  register: (mealId, date, notes = '') => {
    return axiosClient.post('/register/register', { 
      meal_id: mealId, 
      date, 
      notes 
    })
  },

  // Hủy suất ăn
  cancel: (registrationId) => {
    return axiosClient.post(`/register/cancel/${registrationId}`)
  },

  // Lấy đăng ký của tôi
  getMyRegistrations: (startDate, endDate, mealType) => {
    return axiosClient.get('/register/my-registrations', {
      params: { 
        start_date: startDate, 
        end_date: endDate, 
        meal_type: mealType 
      }
    })
  },

  // Lấy đăng ký theo ngày
  getByDate: (date, filters = {}) => {
    return axiosClient.get(`/register/date/${date}`, { params: filters })
  },

  // Kiểm tra trạng thái đăng ký
  checkStatus: (date) => {
    return axiosClient.get('/register/check-status', { params: { date } })
  },

  // Thống kê đăng ký
  getStats: (startDate, endDate) => {
    return axiosClient.get('/register/stats', {
      params: { start_date: startDate, end_date: endDate }
    })
  },

  // Lấy lịch sử đăng ký
  getHistory: (limit = 20, page = 1) => {
    return axiosClient.get('/register/history', {
      params: { limit, page }
    })
  },

  // Cập nhật ghi chú
  updateNotes: (registrationId, notes) => {
    return axiosClient.put(`/register/${registrationId}/notes`, { notes })
  }
}

export default registerApi