import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { BarChart, PieChart } from '../../components/Chart'
import userApi from '../../api/userApi'
import statsApi from '../../api/statsApi'
import toast from 'react-hot-toast'
import {
  FaUsers,
  FaUtensils,
  FaBuilding,
  FaCalendarDay,
  FaChartLine
} from 'react-icons/fa'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // 📌 Responsive Layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 📌 Load Dashboard Data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, trendsRes] = await Promise.all([
        userApi.getDashboardStats(),
        statsApi.getTrends('week')
      ])

      if (dashboardRes.success && trendsRes.success) {
        setStats(dashboardRes.data)
        setTrendData(trendsRes.data)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Lỗi tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getRoleCount = (role) => {
    if (!stats?.user_stats) return 0
    const roleStat = stats.user_stats.find(s => s.role === role)
    return roleStat ? roleStat.count : 0
  }

  // 📌 Cards hiển thị thống kê
  const statCards = [
    {
      title: 'Tổng quân nhân',
      value: getRoleCount('soldier'),
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Suất ăn hôm nay',
      value: stats?.today_meals || 0,
      icon: FaUtensils,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Đơn vị',
      value: stats?.unit_stats?.length || 0,
      icon: FaBuilding,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    },
    {
      title: 'Admin',
      value: getRoleCount('admin'),
      icon: FaUsers,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ]

  // 📌 Chuẩn bị dữ liệu Bar Chart
  const prepareChartData = () => {
    if (!trendData?.chartData) return null

    const dates = trendData.chartData.map(d => d.date)
    const breakfast = trendData.chartData.map(d => d.breakfast || 0)
    const lunch = trendData.chartData.map(d => d.lunch || 0)
    const dinner = trendData.chartData.map(d => d.dinner || 0)

    return {
      labels: dates,
      datasets: [
        {
          label: 'Bữa sáng',
          data: breakfast,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        },
        {
          label: 'Bữa trưa',
          data: lunch,
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 1
        },
        {
          label: 'Bữa tối',
          data: dinner,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }
      ]
    }
  }

  // 📌 Chuẩn bị dữ liệu Pie Chart
  const preparePieData = () => {
    if (!stats?.unit_stats) return null

    return {
      labels: stats.unit_stats.map(u => u.unit_name || 'Chưa phân đơn vị'),
      datasets: [
        {
          data: stats.unit_stats.map(u => u.meal_count || 0),
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#8B5CF6',
            '#F59E0B',
            '#EF4444',
            '#EC4899'
          ]
        }
      ]
    }
  }

  // 📌 Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-gray-200 rounded"></div>
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 📌 Render giao diện chính
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />

        <main className={`flex-1 transition-all duration-300 ${isMobile ? 'p-2' : 'p-6'} pt-20 lg:pt-6`}>
          <div className={isMobile ? 'p-2' : 'mb-6'}>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Tổng quan hệ thống</p>
          </div>

          {/* Cards thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{card.title}</p>
                    <p className="text-2xl font-bold mt-2">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                    <card.icon className={`text-2xl ${card.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Xu hướng đăng ký (7 ngày)</h3>
                <FaChartLine className="text-blue-500" />
              </div>
              {trendData && (
                <div className="h-72">
                  <BarChart data={prepareChartData()} title="" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Phân bố theo đơn vị</h3>
                <FaBuilding className="text-purple-500" />
              </div>
              {stats?.unit_stats && (
                <div className="h-72">
                  <PieChart data={preparePieData()} title="" />
                </div>
              )}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {stats?.unit_stats?.slice(0, 5).map((unit, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarDay className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{unit.unit_name || 'Chưa phân đơn vị'}</p>
                      <p className="text-sm text-gray-500">
                        {unit.user_count} người • {unit.meal_count} suất ăn
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Hôm nay</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
