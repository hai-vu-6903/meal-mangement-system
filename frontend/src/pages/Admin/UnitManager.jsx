import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import unitApi from '../../api/unitApi'
import toast from 'react-hot-toast'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaBuilding,
  FaSearch
} from 'react-icons/fa'

const UnitManager = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [formData, setFormData] = useState({
    unit_code: '',
    unit_name: '',
    description: ''
  })

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await unitApi.getAll()
      if (response.success) {
        setUnits(response.data)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Lỗi tải danh sách đơn vị')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = (unit) => {
    setEditingUnit(unit)
    setFormData({
      unit_code: unit.unit_code,
      unit_name: unit.unit_name,
      description: unit.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn vị này? Các thành viên sẽ bị chuyển về "Chưa phân đơn vị".')) return

    try {
      const response = await unitApi.delete(id)
      if (response.success) {
        toast.success('Xóa đơn vị thành công')
        fetchUnits()
      }
    } catch (error) {
      toast.error(error.message || 'Xóa thất bại')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let response
      if (editingUnit) {
        response = await unitApi.update(editingUnit.id, formData)
      } else {
        response = await unitApi.create(formData)
      }

      if (response.success) {
        toast.success(editingUnit ? 'Cập nhật thành công' : 'Tạo đơn vị thành công')
        setShowModal(false)
        fetchUnits()
        resetForm()
      }
    } catch (error) {
      toast.error(error.message || 'Thao tác thất bại')
    }
  }

  const resetForm = () => {
    setFormData({
      unit_code: '',
      unit_name: '',
      description: ''
    })
    setEditingUnit(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn vị</h1>
              <p className="text-gray-600">Quản lý các đơn vị/phòng ban trong hệ thống</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Thêm đơn vị
            </button>
          </div>

          {/* Units Grid */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : units.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <FaBuilding className="text-4xl mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Chưa có đơn vị nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {units.map(unit => (
                <div key={unit.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{unit.unit_name}</h3>
                        <p className="text-sm text-gray-500">Mã: {unit.unit_code}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    {unit.description && (
                      <p className="text-gray-600 mb-4 text-sm">{unit.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-2" />
                        <span className="text-sm">{unit.member_count || 0} thành viên</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Tạo: {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {units.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Tổng hợp</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng số đơn vị</p>
                  <p className="text-2xl font-bold text-blue-600">{units.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng thành viên</p>
                  <p className="text-2xl font-bold text-green-600">
                    {units.reduce((sum, unit) => sum + (unit.member_count || 0), 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Đơn vị có nhiều thành viên nhất</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {units.reduce((max, unit) => 
                      (unit.member_count || 0) > (max.member_count || 0) ? unit : max
                    ).unit_name}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Đơn vị mới nhất</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {units.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.unit_name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUnit ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn vị *</label>
                    <input
                      type="text"
                      name="unit_code"
                      value={formData.unit_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="VD: UNIT001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị *</label>
                    <input
                      type="text"
                      name="unit_name"
                      value={formData.unit_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="VD: Đại đội 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Mô tả về đơn vị..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingUnit ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnitManager