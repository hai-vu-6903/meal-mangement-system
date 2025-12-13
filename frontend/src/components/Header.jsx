import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaBell,
  FaCog,
  FaHistory,
  FaChartBar,
  FaBars
} from "react-icons/fa";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const roleName = user?.role === "admin" ? "Quản trị viên" : "Quân nhân";
  const dashboardPath = user?.role === "admin" ? "/admin" : "/soldier";

  const getUserInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navigateTo = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16">
      <div className="px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Menu button and Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Mở menu"
            >
              <FaBars className="text-xl" />
            </button>
            
            <Link
              to={dashboardPath}
              className="flex items-center space-x-3 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <FaHome className="text-white text-lg" />
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-lg">Quản lý suất ăn</h1>
                <p className="text-xs text-gray-600">
                  Quân đội nhân dân Việt Nam
                </p>
              </div>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notification */}
            <button
              className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"
              title="Thông báo"
              aria-label="Thông báo"
            >
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Mở menu người dùng"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                    {getUserInitials(user?.full_name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full text-white flex items-center justify-center font-bold text-lg">
                          {getUserInitials(user?.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-800 truncate">
                            {user?.full_name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {user?.military_code}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {roleName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => navigateTo(dashboardPath)}
                        className="flex w-full items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                      >
                        <FaHome className="mr-3 text-blue-600" />
                        <span>Trang chủ</span>
                      </button>

                      <button
                        onClick={() =>
                          navigateTo(
                            user.role === "admin"
                              ? "/admin"
                              : "/soldier/profile"
                          )
                        }
                        className="flex w-full items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                      >
                        <FaUserCircle className="mr-3 text-green-600" />
                        <span>Hồ sơ cá nhân</span>
                      </button>

                      <button
                        onClick={() =>
                          navigateTo(
                            user.role === "admin"
                              ? "/admin/stats"
                              : "/soldier/stats"
                          )
                        }
                        className="flex w-full items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                      >
                        <FaChartBar className="mr-3 text-purple-600" />
                        <span>Thống kê</span>
                      </button>

                      {user.role === "soldier" && (
                        <button
                          onClick={() => navigateTo("/soldier/history")}
                          className="flex w-full items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                        >
                          <FaHistory className="mr-3 text-yellow-600" />
                          <span>Lịch sử đăng ký</span>
                        </button>
                      )}

                      {user.role === "admin" && (
                        <button
                          onClick={() => navigateTo("/admin/config")}
                          className="flex w-full items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                        >
                          <FaCog className="mr-3 text-gray-700" />
                          <span>Cài đặt hệ thống</span>
                        </button>
                      )}

                      <div className="border-t my-2" />

                      <button
                        onClick={handleLogoutClick}
                        className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt className="mr-3" />
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
};

export default Header;