import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Trang không tìm thấy</h2>
          <p className="text-gray-500 mb-8">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Về trang chủ
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên.</p>
            <p className="mt-2">Mã lỗi: 404 | Không tìm thấy tài nguyên</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-white rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Kiểm tra URL</h4>
              <p className="text-sm text-gray-600">
                Đảm bảo URL bạn nhập đúng chính tả và đầy đủ
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Đăng nhập lại</h4>
              <p className="text-sm text-gray-600">
                Thử đăng nhập lại nếu phiên làm việc đã hết hạn
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Liên hệ hỗ trợ</h4>
              <p className="text-sm text-gray-600">
                Liên hệ quản trị viên nếu sự cố vẫn tiếp diễn
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound