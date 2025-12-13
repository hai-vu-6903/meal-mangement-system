import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import statsApi from '../../api/statsApi'
import { BarChart, PieChart } from '../../components/Chart'
import toast from 'react-hot-toast'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { FaChartBar, FaCalendarWeek, FaFileExport, FaUtensils, FaFilter } from 'react-icons/fa'
import { MdCalendarMonth } from "react-icons/md"

const MealStats = () => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('week')
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchStats()
  }, [period, dateRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      let startDate = dateRange.start
      let endDate = dateRange.end

      console.log('Personal stats response:', response.data);

      if (period === 'month') {
        const now = new Date()
        startDate = format(startOfMonth(now), 'yyyy-MM-dd')
        endDate = format(endOfMonth(now), 'yyyy-MM-dd')
      }

      const response = await statsApi.getPersonal(startDate, endDate)
      if (response.data?.success) {
        setStats(response.data.data)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Lỗi tải thống kê')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      const res = await statsApi.exportPersonal(dateRange.start, dateRange.end)
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thong_ke_ca_nhan.xlsx'
      a.click()
    } catch {
      toast.error('Xuất Excel thất bại')
    }
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    if (newPeriod === 'week') {
      const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      setDateRange({ start, end })
    } else if (newPeriod === 'month') {
      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const end = format(endOfMonth(new Date()), 'yyyy-MM-dd')
      setDateRange({ start, end })
    }
  }

  const calculateTotals = () => {
    const totals = { breakfast: 0, lunch: 0, dinner: 0 }
    stats.forEach(stat => {
      totals[stat.meal_type] = (totals[stat.meal_type] || 0) + 1
    })
    return { ...totals, total: totals.breakfast + totals.lunch + totals.dinner }
  }

  const prepareBarChartData = () => {
    const totals = calculateTotals()
    return {
      labels: ['Bữa sáng', 'Bữa trưa', 'Bữa tối'],
      datasets: [{
        label: 'Số bữa đã đăng ký',
        data: [totals.breakfast, totals.lunch, totals.dinner],
        backgroundColor: ['rgba(34,197,94,0.5)','rgba(234,179,8,0.5)','rgba(59,130,246,0.5)'],
        borderColor: ['rgb(34,197,94)','rgb(234,179,8)','rgb(59,130,246)'],
        borderWidth: 1
      }]
    }
  }

  const preparePieChartData = () => {
    const totals = calculateTotals()
    return {
      labels: ['Bữa sáng', 'Bữa trưa', 'Bữa tối'],
      datasets: [{
        data: [totals.breakfast, totals.lunch, totals.dinner],
        backgroundColor: ['rgb(34,197,94)','rgb(234,179,8)','rgb(59,130,246)'],
        hoverOffset: 4
      }]
    }
  }

  const PeriodTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button onClick={() => handlePeriodChange('week')}
          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
            period==='week' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}>
          <FaCalendarWeek className="mr-2"/> Theo tuần
        </button>
        <button onClick={() => handlePeriodChange('month')}
          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
            period==='month' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}>
          <MdCalendarMonth className="mr-2"/> Theo tháng
        </button>
        <button onClick={() => handlePeriodChange('custom')}
          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
            period==='custom' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}>
          <FaFilter className="mr-2"/> Tùy chọn
        </button>
      </nav>
    </div>
  )

  const DateRangeFilter = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FaFilter className="text-blue-500"/>
          <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
          <input type="date" value={dateRange.start} onChange={e=>setDateRange({...dateRange,start:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
          <span className="text-gray-500">đến</span>
          <input type="date" value={dateRange.end} onChange={e=>setDateRange({...dateRange,end:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
        </div>
        <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
          <FaFileExport className="mr-2"/> Xuất Excel
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Thống kê cá nhân</h1>
            <p className="text-gray-600">Thống kê suất ăn của bạn</p>
          </div>

          <PeriodTabs />
          {period==='custom' && <DateRangeFilter />}

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {['breakfast','lunch','dinner','total'].map((type,idx)=>{
                  const totals = calculateTotals()
                  const colors = ['green','yellow','blue','purple']
                  const labels = ['Bữa sáng','Bữa trưa','Bữa tối','Tổng số bữa']
                  const values = [totals.breakfast,totals.lunch,totals.dinner,totals.total]
                  return (
                    <div key={type} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{labels[idx]}</p>
                          <p className={`text-2xl font-bold text-${colors[idx]}-600`}>{values[idx]}</p>
                        </div>
                        <div className={`p-3 bg-${colors[idx]}-100 rounded-lg`}>
                          {type==='total' ? <FaChartBar className={`text-${colors[idx]}-600`}/> : <FaUtensils className={`text-${colors[idx]}-600`}/>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Phân bố suất ăn</h3>
                  <div className="h-72"><BarChart data={prepareBarChartData()} title=""/></div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-semibold text-gray-700 mb-4">Tỷ lệ các bữa ăn</h3>
                  <div className="h-72"><PieChart data={preparePieChartData()} title=""/></div>
                </div>
              </div>

              {/* Details Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Chi tiết thống kê</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bữa ăn</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trung bình/ngày</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {['breakfast','lunch','dinner'].map(mealType=>{
                          const count = stats.filter(s=>s.meal_type===mealType).length
                          const totals = calculateTotals()
                          const total = totals.total || 1
                          const percentage = Math.round((count/total)*100)
                          const daysDiff = Math.max(1,(new Date(dateRange.end)-new Date(dateRange.start))/(1000*60*60*24))
                          const average = (count/daysDiff).toFixed(1)
                          return (
                            <tr key={mealType}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  mealType==='breakfast'?'bg-green-100 text-green-800':mealType==='lunch'?'bg-yellow-100 text-yellow-800':'bg-blue-100 text-blue-800'
                                }`}>{mealType==='breakfast'?'Bữa sáng':mealType==='lunch'?'Bữa trưa':'Bữa tối'}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap"><span className="text-lg font-medium">{count}</span></td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div className={`h-2.5 rounded-full ${mealType==='breakfast'?'bg-green-500':mealType==='lunch'?'bg-yellow-500':'bg-blue-500'}`} style={{width:`${percentage}%`}}></div>
                                  </div>
                                  <span>{percentage}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap"><span className="text-gray-700">{average} bữa/ngày</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MealStats
