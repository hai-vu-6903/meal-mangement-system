import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import CalendarMeal from '../../components/CalendarMeal'
import { useAuth } from '../../context/AuthContext'
import registerApi from '../../api/registerApi'
import toast from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUtensils,
  FaClock,
  FaHistory
} from 'react-icons/fa'

const MealRegister = () => {
  const { user } = useAuth()
  const [todayStats, setTodayStats] = useState({
    registered: 0,
    total: 3
  })
  const [loading, setLoading] = useState(true)
  const [recentHistory, setRecentHistory] = useState([])

  useEffect(() => {
    fetchTodayStatus()
    fetchRecentHistory()
  }, [])

  const fetchTodayStatus = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await registerApi.checkStatus(today)
      
      if (response.success) {
        const registeredCount = response.data.filter(r => r.status === 'registered' || r.is_registered).length
        setTodayStats({
          registered: registeredCount,
          total: response.data.length
        })
      }
    } catch (error) {
      console.error('Error fetching today status:', error)
      toast.error('Không thể tải trạng thái hôm nay')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentHistory = async () => {
    try {
      const response = await registerApi.getHistory(5, 1)
      if (response.success) {
        setRecentHistory(response.data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const getMealTypeName = (type) => {
    const types = {
      breakfast: 'Sáng',
      lunch: 'Trưa',
      dinner: 'Tối'
    }
    return types[type] || type
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Đăng ký suất ăn</h1>
        <p className="text-gray-600 mt-2">Đăng ký và quản lý suất ăn hàng ngày của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800 mt-1">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <FaCalendarAlt className="text-blue-600 text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã đăng ký hôm nay</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600 mt-1">
                {todayStats.registered}/{todayStats.total}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
              <FaUtensils className="text-green-600 text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className={`text-lg font-semibold mt-1 ${
                todayStats.registered === todayStats.total ? 'text-green-600' :
                todayStats.registered > 0 ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {todayStats.registered === todayStats.total ? 'Đã đăng ký đủ' :
                todayStats.registered > 0 ? 'Đã đăng ký một phần' : 'Chưa đăng ký'}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <FaInfoCircle className="text-yellow-600 text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hạn đăng ký</p>
              <p className="text-lg lg:text-xl font-semibold text-red-600 mt-1">
                18:00
              </p>
              <p className="text-xs text-gray-500">hôm nay</p>
            </div>
            <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
              <FaClock className="text-red-600 text-lg lg:text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <CalendarMeal />
      </div>

      {recentHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
            <FaHistory className="mr-2" />
            Lịch sử gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bữa ăn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentHistory.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(item.registration_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.meal_type === 'breakfast' ? 'bg-green-100 text-green-800' :
                        item.meal_type === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getMealTypeName(item.meal_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.registered_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'registered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'registered' ? 'Đã đăng ký' : 'Đã hủy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Hướng dẫn sử dụng</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Cách đăng ký:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
                <span>Nhấn vào ô bữa ăn chưa đăng ký để đăng ký</span>
              </li>
              <li className="flex items-center">
                <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded mr-2"></div>
                <span>Nhấn vào ô bữa ăn đã đăng ký để hủy</span>
              </li>
              <li className="flex items-center">
                <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded mr-2"></div>
                <span>Ô màu xám: chưa đăng ký</span>
              </li>
              <li className="flex items-center">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded mr-2"></div>
                <span>Ô viền xanh: hôm nay</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Quy định:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <FaClock className="text-green-500 mr-2" />
                <span>Đăng ký trước 18:00 hàng ngày</span>
              </li>
              <li className="flex items-center">
                <FaClock className="text-yellow-500 mr-2" />
                <span>Hủy trước 00:00 ngày hôm đó</span>
              </li>
              <li className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span>Không hủy được suất ăn của ngày đã qua</span>
              </li>
              <li className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span>Không đăng ký được ngày đã qua</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mt-1 mr-2" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Lưu ý quan trọng:</strong> Suất ăn đã đăng ký sau 18:00 sẽ không thể hủy. 
                Vui lòng kiểm tra kỹ trước khi đăng ký. Thay đổi sẽ được cập nhật ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MealRegister