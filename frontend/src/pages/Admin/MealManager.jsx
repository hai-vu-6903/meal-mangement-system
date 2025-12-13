import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import mealApi from '../../api/mealApi'
import statsApi from '../../api/statsApi'
import unitApi from '../../api/unitApi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaPrint,
  FaEye,
  FaUtensilSpoon,
  FaTimes,
  FaCheck
} from 'react-icons/fa'

const MealManager = () => {
  const [registrations, setRegistrations] = useState([])
  const [summary, setSummary] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filters, setFilters] = useState({
    unit_id: '',
    meal_type: '',
    search: ''
  })

  useEffect(() => {
    fetchMealRegistrations()
    fetchUnits()
  }, [selectedDate, filters])

  const fetchMealRegistrations = async () => {
    try {
      setLoading(true)
      const response = await mealApi.getByDate(selectedDate, filters)

      console.log('Meal API response:', response)

      if (response.success) {
        setRegistrations(response.data.registrations || [])
        setSummary(response.data.summary || [])
      }
    } catch (error) {
      console.error('Meal API error:', error)
      toast.error('Lỗi tải dữ liệu suất ăn')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await unitApi.getAll()
      if (response.success) {
        setUnits(response.data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCancelMeal = async (registrationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy suất ăn này?')) return

    try {
      const response = await mealApi.cancel(registrationId)
      if (response.success) {
        toast.success('Đã hủy suất ăn')
        fetchMealRegistrations()
      }
    } catch (error) {
      toast.error(error.message || 'Hủy thất bại')
    }
  }

  const getMealName = (mealType) => {
    const mealNames = {
      breakfast: 'Bữa sáng',
      lunch: 'Bữa trưa',
      dinner: 'Bữa tối'
    }
    return mealNames[mealType] || mealType
  }

  const handleExportExcel = async () => {
    try {
      const blob = await statsApi.exportDaily(selectedDate)

      if (blob.type === 'application/json') {
        const text = await blob.text()
        const error = JSON.parse(text)
        alert(error.message)
        return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suat-an-${selectedDate}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert('Xuất Excel thất bại')
    }
  }

  const safeSummary = Array.isArray(summary) ? summary : []

  const mealSummary = [
    {
      type: 'breakfast',
      name: 'Bữa sáng',
      count: safeSummary.find(s => s.meal_type === 'breakfast')?.registered_count || 0,
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'lunch',
      name: 'Bữa trưa',
      count: safeSummary.find(s => s.meal_type === 'lunch')?.registered_count || 0,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      type: 'dinner',
      name: 'Bữa tối',
      count: safeSummary.find(s => s.meal_type === 'dinner')?.registered_count || 0,
      color: 'bg-blue-100 text-blue-800'
    }
  ]

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý suất ăn</h1>
          <p className="text-gray-600">Xem và quản lý suất ăn của tất cả quân nhân</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <FaPrint className="mr-2" />
          Xuất Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
            />
          </div>
          
          <div className="text-lg font-semibold text-gray-800">
            {format(new Date(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {mealSummary.map((meal) => (
            <div key={meal.type} className={`p-4 rounded-lg ${meal.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{meal.name}</p>
                  <p className="text-2xl font-bold mt-1">{meal.count}</p>
                </div>
                <FaUtensilSpoon className="text-2xl opacity-75" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaFilter className="mr-2" />
              Lọc theo đơn vị
            </label>
            <select
              value={filters.unit_id}
              onChange={(e) => handleFilterChange('unit_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả đơn vị</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.unit_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo bữa ăn</label>
            <select
              value={filters.meal_type}
              onChange={(e) => handleFilterChange('meal_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả bữa ăn</option>
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaSearch className="mr-2" />
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaUtensilSpoon className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>Không có đăng ký suất ăn nào cho ngày này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quân nhân</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bữa ăn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg, index) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                      <div className="text-sm text-gray-500">{reg.military_code} • {reg.position}</div>
                      <div className="text-sm text-gray-500">{reg.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reg.unit_name || 'Chưa phân đơn vị'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reg.meal_type === 'breakfast' ? 'bg-green-100 text-green-800' :
                        reg.meal_type === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {getMealName(reg.meal_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(reg.registered_at), 'HH:mm dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCancelMeal(reg.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Hủy suất ăn"
                      >
                        <FaTimes className="mr-1" />
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {registrations.length > 0 && (
        <div className="mt-4 bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng số người</p>
              <p className="text-2xl font-bold text-gray-800">
                {Array.from(new Set(registrations.map(r => r.user_id))).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng bữa sáng</p>
              <p className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.meal_type === 'breakfast').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng bữa trưa</p>
              <p className="text-2xl font-bold text-yellow-600">
                {registrations.filter(r => r.meal_type === 'lunch').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng bữa tối</p>
              <p className="text-2xl font-bold text-blue-600">
                {registrations.filter(r => r.meal_type === 'dinner').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default MealManager