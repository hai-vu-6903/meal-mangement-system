import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import configApi from '../../api/configApi'
import toast from 'react-hot-toast'
import {
  FaCog,
  FaSave,
  FaEdit,
  FaTrash,
  FaPlus,
  FaClock,
  FaBell,
  FaUtensils
} from 'react-icons/fa'

const SystemConfig = () => {
  const [configs, setConfigs] = useState([])
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState(null)
  const [editingMeal, setEditingMeal] = useState(null)
  const [showMealModal, setShowMealModal] = useState(false)
  const [mealForm, setMealForm] = useState({
    meal_type: 'breakfast',
    meal_name: '',
    description: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await configApi.getAll()
      if (response.success) {
        setConfigs(response.data.system_configs)
        setMeals(response.data.meals)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Lỗi tải cấu hình')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key, value) => {
    setConfigs(prev => prev.map(config => 
      config.config_key === key ? { ...config, config_value: value } : config
    ))
  }

  const handleSaveConfig = async (key, value) => {
    try {
      const response = await configApi.update(key, value)
      if (response.success) {
        toast.success('Cập nhật cấu hình thành công')
        setEditingConfig(null)
      }
    } catch (error) {
      toast.error(error.message || 'Cập nhật thất bại')
    }
  }

  const handleMealInputChange = (e) => {
    const { name, value } = e.target
    setMealForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveMeal = async () => {
    try {
      let response
      if (editingMeal) {
        response = await configApi.updateMeal(editingMeal.id, mealForm)
      } else {
        response = await configApi.createMeal(mealForm)
      }

      if (response.success) {
        toast.success(editingMeal ? 'Cập nhật bữa ăn thành công' : 'Tạo bữa ăn thành công')
        setShowMealModal(false)
        setEditingMeal(null)
        resetMealForm()
        fetchConfigs()
      }
    } catch (error) {
      toast.error(error.message || 'Thao tác thất bại')
    }
  }

  const handleDeleteMeal = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bữa ăn này?')) return

    try {
      const response = await configApi.deleteMeal(id)
      if (response.success) {
        toast.success('Xóa bữa ăn thành công')
        fetchConfigs()
      }
    } catch (error) {
      toast.error(error.message || 'Xóa thất bại')
    }
  }

  const handleEditMeal = (meal) => {
    setEditingMeal(meal)
    setMealForm({
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      description: meal.description || '',
      start_time: meal.start_time || '',
      end_time: meal.end_time || ''
    })
    setShowMealModal(true)
  }

  const resetMealForm = () => {
    setMealForm({
      meal_type: 'breakfast',
      meal_name: '',
      description: '',
      start_time: '',
      end_time: ''
    })
    setEditingMeal(null)
  }

  const getMealTypeName = (type) => {
    const types = {
      breakfast: 'Bữa sáng',
      lunch: 'Bữa trưa',
      dinner: 'Bữa tối'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h1>
        <p className="text-gray-600">Cài đặt và quản lý hệ thống</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <FaCog className="mr-2" />
            Cấu hình chung
          </h3>
          <span className="text-sm text-gray-500 mt-2 lg:mt-0">Admin only</span>
        </div>

        <div className="space-y-6">
          {configs.map((config) => (
            <div key={config.config_key} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2">
                <div className="mb-2 lg:mb-0">
                  <h4 className="font-medium text-gray-800">{config.config_key}</h4>
                  <p className="text-sm text-gray-500">{config.description || 'Không có mô tả'}</p>
                </div>
                <button
                  onClick={() => setEditingConfig(config.config_key)}
                  className="text-blue-600 hover:text-blue-800 self-start lg:self-center"
                >
                  <FaEdit />
                </button>
              </div>
              
              {editingConfig === config.config_key ? (
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2 mt-2">
                  <input
                    type="text"
                    value={config.config_value || ''}
                    onChange={(e) => handleConfigChange(config.config_key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveConfig(config.config_key, config.config_value)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <FaSave className="mr-2" />
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingConfig(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <code className="bg-gray-100 px-3 py-2 rounded-lg font-mono text-gray-800 break-all">
                    {config.config_value || '(trống)'}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-700 flex items-center">
            <FaUtensils className="mr-2" />
            Quản lý bữa ăn
          </h3>
          <button
            onClick={() => {
              resetMealForm()
              setShowMealModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 mt-4 lg:mt-0"
          >
            <FaPlus className="mr-2" />
            Thêm bữa ăn
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại bữa</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bữa</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meals.map((meal) => (
                <tr key={meal.id}>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      meal.meal_type === 'breakfast' ? 'bg-green-100 text-green-800' :
                      meal.meal_type === 'lunch' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getMealTypeName(meal.meal_type)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap font-medium">
                    {meal.meal_name}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-1" />
                      {meal.start_time ? `${meal.start_time} - ${meal.end_time}` : 'Cả ngày'}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {meal.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMeal(meal)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <FaBell className="text-blue-500 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Chỉ được xóa bữa ăn khi không có người đăng ký
            </p>
          </div>
        </div>
      </div>

      {showMealModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 lg:top-20 mx-auto p-4 lg:p-5 border w-11/12 lg:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMeal ? 'Chỉnh sửa bữa ăn' : 'Thêm bữa ăn mới'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại bữa *</label>
                  <select
                    name="meal_type"
                    value={mealForm.meal_type}
                    onChange={handleMealInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="breakfast">Bữa sáng</option>
                    <option value="lunch">Bữa trưa</option>
                    <option value="dinner">Bữa tối</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bữa *</label>
                  <input
                    type="text"
                    name="meal_name"
                    value={mealForm.meal_name}
                    onChange={handleMealInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Bữa sáng chính"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      name="start_time"
                      value={mealForm.start_time}
                      onChange={handleMealInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      name="end_time"
                      value={mealForm.end_time}
                      onChange={handleMealInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={mealForm.description}
                    onChange={handleMealInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Mô tả về bữa ăn..."
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setShowMealModal(false)
                    resetMealForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 order-2 sm:order-1"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveMeal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center order-1 sm:order-2"
                >
                  <FaSave className="mr-2" />
                  {editingMeal ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default SystemConfig