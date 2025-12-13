import React from 'react'
import { FaSignOutAlt, FaTimes } from 'react-icons/fa'

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <FaSignOutAlt className="text-red-600 text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Xác nhận đăng xuất</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống? Tất cả các thay đổi chưa lưu sẽ bị mất.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg transition-all font-medium flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Lưu ý:</strong> Sau khi đăng xuất, bạn cần đăng nhập lại để tiếp tục sử dụng hệ thống.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal