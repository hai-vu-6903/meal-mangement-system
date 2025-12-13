import axiosClient from './axiosClient'

const statsApi = {

  // thống kê
  getDaily: (date) => {
    return axiosClient.get('/stats/daily', { params: { date } })
  },

  getMonthly: (year, month) => {
    return axiosClient.get('/stats/monthly', { params: { year, month } })
  },

  getTrends: (period) => {
    return axiosClient.get('/stats/trends', { params: { period } })
  },

  // Xuất Excel
  exportDaily: (date) => {
    return axiosClient.get('/stats/export/daily', {
      params: { date },
      responseType: 'blob'
    })
  },

  exportMonthly: (year, month) => {
    return axiosClient.get('/stats/export/monthly', {
      params: { year, month },
      responseType: 'blob'
    })
  },

  exportPersonal: (start_date, end_date) => {
    return axiosClient.get('/stats/export/personal', {
      params: { start_date, end_date },
      responseType: 'blob'
    })
  },

  getPersonal: (start_date, end_date) => {
  const token = localStorage.getItem('token'); // lấy token
  return axiosClient.get('/stats/personal', {
    params: { start_date, end_date },
    headers: {
      Authorization: `Bearer ${token}` // gửi token
    }
  })
}

}

export default statsApi