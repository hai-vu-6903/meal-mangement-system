import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isToday, isPast, addMonths, subMonths, 
         parseISO, isAfter, isBefore, startOfWeek, endOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import registerApi from '../api/registerApi'
import mealApi from '../api/mealApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaCheck, FaUtensils, FaRegClock, FaSpinner, FaTimes } from 'react-icons/fa'

const CalendarMeal = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [registrations, setRegistrations] = useState({})
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    fetchMeals()
    fetchMonthRegistrations()
  }, [currentDate])

  const fetchMeals = async () => {
    try {
      const response = await mealApi.getActiveMeals()
      if (response.success) {
        console.log('Meals loaded:', response.data)
        setMeals(response.data)
      } else {
        toast.error('Không thể tải danh sách bữa ăn')
      }
    } catch (error) {
      console.error('Error fetching meals:', error)
      toast.error('Lỗi tải danh sách bữa ăn')
    }
  }

  const fetchMonthRegistrations = async () => {
    try {
      setLoading(true)
      const firstDay = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const lastDay = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      
      console.log('Fetching registrations from', firstDay, 'to', lastDay)
      
      const response = await registerApi.getMyRegistrations(firstDay, lastDay)
      
      if (response.success) {
        console.log('Registrations loaded:', response.data)
        
        // Tạo map registrations theo ngày và loại bữa
        const registrationsMap = {}
        response.data.forEach(reg => {
          const dateKey = format(new Date(reg.registration_date), 'yyyy-MM-dd')
          if (!registrationsMap[dateKey]) {
            registrationsMap[dateKey] = {}
          }
          registrationsMap[dateKey][reg.meal_type] = {
            id: reg.id,
            registration_id: reg.id,
            registered: true,
            status: reg.status
          }
        })
        
        setRegistrations(registrationsMap)
      } else {
        toast.error('Không thể tải dữ liệu đăng ký')
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Lỗi tải dữ liệu đăng ký')
    } finally {
      setLoading(false)
    }
  }

  const handleMealAction = async (date, mealType, isRegistered, registrationId) => {
    if (actionLoading) return

    const dateObj = parseISO(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    console.log('Meal action:', { date, mealType, isRegistered, registrationId })

    // Kiểm tra quy tắc
    if (isRegistered) {
      // Kiểm tra hủy
      if (isBefore(dateObj, today)) {
        toast.error('Không thể hủy suất ăn của ngày đã qua')
        return
      }
      
      if (isToday(dateObj)) {
        toast.error('Không thể hủy suất ăn trong ngày hôm nay')
        return
      }
    } else {
      // Kiểm tra đăng ký
      if (isBefore(dateObj, today)) {
        toast.error('Không thể đăng ký suất ăn cho ngày đã qua')
        return
      }
    }

    setActionLoading(true)
    try {
      if (isRegistered) {
        // Hủy suất ăn
        await registerApi.cancel(registrationId)
        toast.success('Đã hủy suất ăn thành công')
      } else {
        // Tìm meal_id
        const meal = meals.find(m => m.meal_type === mealType)
        if (meal) {
          console.log('Registering meal:', meal.id, date)
          await registerApi.register(meal.id, date)
          toast.success('Đã đăng ký suất ăn thành công')
        } else {
          toast.error('Không tìm thấy thông tin bữa ăn')
        }
      }
      
      // Refresh data
      await fetchMonthRegistrations()
    } catch (error) {
      console.error('Meal action error:', error)
      toast.error(error.message || 'Thao tác thất bại. Vui lòng thử lại.')
    } finally {
      setActionLoading(false)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'next') {
        newDate.setMonth(prev.getMonth() + 1)
      } else {
        newDate.setMonth(prev.getMonth() - 1)
      }
      return newDate
    })
  }

  const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getMealName = (mealType) => {
    const mealNames = {
      breakfast: 'Sáng',
      lunch: 'Trưa',
      dinner: 'Tối'
    }
    return mealNames[mealType] || mealType
  }

  const getMealColor = (mealType, isRegistered) => {
    if (!isRegistered) return 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
    
    switch (mealType) {
      case 'breakfast': return 'bg-green-50 hover:bg-green-100 border border-green-300 text-green-700'
      case 'lunch': return 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-yellow-700'
      case 'dinner': return 'bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700'
      default: return 'bg-gray-50'
    }
  }

  const getDayStatus = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayRegistrations = registrations[dateKey] || {}
    const registeredCount = Object.values(dayRegistrations).filter(r => r.registered).length
    
    if (isToday(day)) {
      return 'today'
    } else if (isPast(day) && !isToday(day)) {
      return 'past'
    } else if (registeredCount === meals.length) {
      return 'all-registered'
    } else if (registeredCount > 0) {
      return 'partial-registered'
    } else {
      return 'not-registered'
    }
  }

  const handleDayClick = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    setSelectedDay(dateKey)
    
    // Fetch detailed status for selected day
    fetchDayStatus(dateKey)
  }

  const fetchDayStatus = async (date) => {
    try {
      const response = await registerApi.checkStatus(date)
      if (response.success) {
        console.log('Day status:', response.data)
        // Hiển thị thông tin chi tiết hoặc update UI
      }
    } catch (error) {
      console.error('Error fetching day status:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-600"
          disabled={actionLoading}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden lg:inline">Tháng trước</span>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-600"
          disabled={actionLoading}
        >
          <span className="hidden lg:inline">Tháng sau</span>
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600 py-1 lg:py-2 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {monthDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayRegistrations = registrations[dateKey] || {}
          const dayStatus = getDayStatus(day)
          const isDayPast = isPast(day) && !isToday(day)
          const isDayToday = isToday(day)

          return (
            <div
              key={dateKey}
              onClick={() => handleDayClick(day)}
              className={`min-h-[100px] lg:min-h-[120px] rounded-lg p-1 lg:p-2 cursor-pointer transition-all ${
                dayStatus === 'today' ? 'border-2 border-blue-500 bg-blue-50' :
                dayStatus === 'past' ? 'bg-gray-50 border border-gray-200' :
                dayStatus === 'all-registered' ? 'bg-green-50 border border-green-200' :
                dayStatus === 'partial-registered' ? 'bg-yellow-50 border border-yellow-200' :
                'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              } ${selectedDay === dateKey ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Day Header */}
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium ${
                  dayStatus === 'today' ? 'text-blue-600' :
                  !isSameMonth(day, currentDate) ? 'text-gray-400' :
                  'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </span>
                {isDayToday && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Hôm nay
                  </span>
                )}
              </div>

              {/* Meal Buttons */}
              <div className="space-y-1">
                {meals.map(meal => {
                  const isRegistered = dayRegistrations[meal.meal_type]?.registered
                  const registrationId = dayRegistrations[meal.meal_type]?.registration_id
                  const canCancel = !isDayPast && !isDayToday
                  const canRegister = !isDayPast

                  return (
                    <button
                      key={meal.meal_type}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMealAction(dateKey, meal.meal_type, isRegistered, registrationId)
                      }}
                      disabled={actionLoading || (isDayPast && !isRegistered) || (!canCancel && isRegistered)}
                      className={`w-full text-xs p-1 lg:p-2 rounded flex items-center justify-between transition-all ${
                        getMealColor(meal.meal_type, isRegistered)
                      } ${
                        (actionLoading || (isDayPast && !isRegistered) || (!canCancel && isRegistered)) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer hover:scale-[1.02]'
                      }`}
                      title={isRegistered ? `Nhấn để hủy ${getMealName(meal.meal_type)}` : `Nhấn để đăng ký ${getMealName(meal.meal_type)}`}
                    >
                      <span className="font-medium">{getMealName(meal.meal_type)}</span>
                      {actionLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : isRegistered ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaRegClock className="text-gray-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
            <span>Đã đăng ký</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded mr-2"></div>
            <span>Chưa đăng ký</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded mr-2"></div>
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded mr-2"></div>
            <span>Ngày đã qua</span>
          </div>
        </div>
      </div>

      {/* Action Status */}
      {actionLoading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
          <FaSpinner className="animate-spin text-blue-600 mr-2" />
          <span className="text-blue-700">Đang xử lý...</span>
        </div>
      )}

      {/* Debug Info (chỉ hiển thị trong development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p>Debug Info:</p>
          <p>User ID: {user?.id}</p>
          <p>Meals count: {meals.length}</p>
          <p>Selected day: {selectedDay || 'none'}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <FaUtensils className="mr-2" />
          Nhấn vào ô bữa ăn để đăng ký/hủy nhanh
        </p>
        <p className="mt-1 text-red-500">
          ⚠ Không thể hủy suất ăn của ngày đã qua hoặc hôm nay
        </p>
      </div>
    </div>
  )
}

export default CalendarMeal