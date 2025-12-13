import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import statsApi from '../../api/statsApi'
import { BarChart, LineChart } from '../../components/Chart'
import toast from 'react-hot-toast'
import { format, subDays } from 'date-fns'
import {
  FaChartBar,
  FaCalendarAlt,
  FaFileExport,
  FaFilter,
  FaUsers,
  FaUtensils
} from 'react-icons/fa'

const Stats = () => {
  const [dailyStats, setDailyStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('daily')
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })

  useEffect(() => {
    if (view === 'daily') {
      fetchDailyStats()
    } else if (view === 'monthly') {
      fetchMonthlyStats()
    }
    fetchTrends()
  }, [view, dateRange, selectedMonth])

  const fetchDailyStats = async () => {
    try {
      setLoading(true)
      const response = await statsApi.getDaily(dateRange.end)
      if (response.success) {
        setDailyStats(response.data)
      }
    } catch (error) {
      toast.error('Lỗi tải thống kê ngày')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true)
      const response = await statsApi.getMonthly(selectedMonth.year, selectedMonth.month)
      if (response.success) {
        setMonthlyStats(response.data)
      }
    } catch (error) {
      toast.error('Lỗi tải thống kê tháng')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrends = async () => {
    try {
      const response = await statsApi.getTrends('month')
      if (response.success) {
        setTrends(response.data)
      }
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  const handleExportExcel = async () => {
    try {
      let blob

      if (view === 'daily') {
        blob = await statsApi.exportDaily(dateRange.end)
      } else {
        blob = await statsApi.exportMonthly(
          selectedMonth.year,
          selectedMonth.month
        )
      }

      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      )

      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        view === 'daily'
          ? `thong-ke-ngay-${dateRange.end}.xlsx`
          : `thong-ke-thang-${selectedMonth.month}-${selectedMonth.year}.xlsx`
      )

      document.body.appendChild(link)
      link.click()
      link.remove()

    } catch (error) {
      console.error(error)
      toast.error('Xuất Excel thất bại')
    }
  }

  const prepareBarChartData = () => {
    if (!dailyStats?.stats) return null

    return {
      labels: dailyStats.stats.map(s => s.meal_name),
      datasets: [{
        label: 'Số lượng đăng ký',
        data: dailyStats.stats.map(s => s.registered_count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(59, 130, 246, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 1
      }]
    }
  }

  const prepareMonthlyChartData = () => {
    if (!monthlyStats?.stats) return null

    const stats = monthlyStats.stats.slice(0, 10)

    return {
      labels: stats.map(s => s.full_name.split(' ').pop()),
      datasets: [
        {
          label: 'Bữa sáng',
          data: stats.map(s => s.breakfast_count),
          backgroundColor: 'rgba(34, 197, 94, 0.5)'
        },
        {
          label: 'Bữa trưa',
          data: stats.map(s => s.lunch_count),
          backgroundColor: 'rgba(234, 179, 8, 0.5)'
        },
        {
          label: 'Bữa tối',
          data: stats.map(s => s.dinner_count),
          backgroundColor: 'rgba(59, 130, 246, 0.5)'
        }
      ]
    }
  }

  const prepareTrendChartData = () => {
    if (!trends?.chartData) return null

    const labels = trends.chartData.map(d => d.date)
    const breakfast = trends.chartData.map(d => d.breakfast || 0)
    const lunch = trends.chartData.map(d => d.lunch || 0)
    const dinner = trends.chartData.map(d => d.dinner || 0)

    return {
      labels,
      datasets: [
        {
          label: 'Bữa sáng',
          data: breakfast,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        },
        {
          label: 'Bữa trưa',
          data: lunch,
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.4
        },
        {
          label: 'Bữa tối',
          data: dinner,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    }
  }

  const ViewTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        <button
          onClick={() => setView('daily')}
          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
            view === 'daily'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FaCalendarAlt className="inline mr-2" />
          Theo ngày
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
            view === 'monthly'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FaChartBar className="inline mr-2" />
          Theo tháng
        </button>
      </nav>
    </div>
  )

  const DateFilter = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
          </div>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
          />
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 w-full lg:w-auto"
        >
          <FaFileExport className="mr-2" />
          Xuất Excel
        </button>
      </div>
    </div>
  )

  const MonthFilter = () => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Chọn tháng:</label>
          </div>
          <select
            value={selectedMonth.year}
            onChange={(e) => setSelectedMonth(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth.month}
            onChange={(e) => setSelectedMonth(prev => ({ ...prev, month: parseInt(e.target.value) }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>Tháng {month}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 w-full lg:w-auto"
        >
          <FaFileExport className="mr-2" />
          Xuất Excel
        </button>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thống kê & Báo cáo</h1>
        <p className="text-gray-600">Thống kê chi tiết và xuất báo cáo</p>
      </div>

      <ViewTabs />

      {view === 'daily' ? <DateFilter /> : <MonthFilter />}

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                {view === 'daily' ? 'Phân bố suất ăn theo bữa' : 'Top 10 người đăng ký nhiều nhất'}
              </h3>
              <div className="h-72">
                {view === 'daily' ? (
                  dailyStats && <BarChart data={prepareBarChartData()} title="" />
                ) : (
                  monthlyStats && <BarChart data={prepareMonthlyChartData()} title="" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Xu hướng đăng ký (30 ngày)</h3>
              <div className="h-72">
                {trends && <LineChart data={prepareTrendChartData()} title="" />}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Tổng hợp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng người</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {view === 'daily' 
                        ? dailyStats?.summary?.total_users || 0
                        : monthlyStats?.summary?.total_users || 0
                      }
                    </p>
                  </div>
                  <FaUsers className="text-2xl text-blue-500" />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng bữa sáng</p>
                    <p className="text-2xl font-bold text-green-600">
                      {view === 'daily' 
                        ? dailyStats?.summary?.breakfast_count || 0
                        : monthlyStats?.summary?.breakfast_total || 0
                      }
                    </p>
                  </div>
                  <FaUtensils className="text-2xl text-green-500" />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng bữa trưa</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {view === 'daily' 
                        ? dailyStats?.summary?.lunch_count || 0
                        : monthlyStats?.summary?.lunch_total || 0
                      }
                    </p>
                  </div>
                  <FaUtensils className="text-2xl text-yellow-500" />
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng bữa tối</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {view === 'daily' 
                        ? dailyStats?.summary?.dinner_count || 0
                        : monthlyStats?.summary?.dinner_total || 0
                      }
                    </p>
                  </div>
                  <FaUtensils className="text-2xl text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">Chi tiết dữ liệu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {view === 'daily' ? (
                      <>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bữa ăn</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đăng ký</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quân nhân</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sáng</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trưa</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tối</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {view === 'daily' ? (
                    dailyStats?.stats?.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">{stat.meal_name}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            stat.meal_type === 'breakfast' ? 'bg-green-100 text-green-800' :
                            stat.meal_type === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {stat.registered_count}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {stat.users}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    monthlyStats?.stats?.slice(0, 20).map((stat, index) => (
                      <tr key={index}>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{stat.full_name}</div>
                          <div className="text-sm text-gray-500">{stat.military_code}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">{stat.unit_name || '-'}</td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {stat.breakfast_count}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            {stat.lunch_count}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {stat.dinner_count}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-medium">
                          {stat.total_meals}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

export default Stats