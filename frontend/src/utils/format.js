import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const formatDate = (dateString, formatString = 'dd/MM/yyyy') => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), formatString, { locale: vi })
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'HH:mm dd/MM/yyyy')
}

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]} ${match[3]}`
  }
  return phone
}

export const formatMilitaryCode = (code) => {
  if (!code) return ''
  return code.toUpperCase()
}

export const getMealName = (mealType) => {
  const mealNames = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối'
  }
  return mealNames[mealType] || mealType
}

export const getRoleName = (role) => {
  const roleNames = {
    admin: 'Quản trị viên',
    soldier: 'Quân nhân'
  }
  return roleNames[role] || role
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins} phút`
  if (mins === 0) return `${hours} giờ`
  return `${hours} giờ ${mins} phút`
}

export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidPhone = (phone) => {
  const re = /^[0-9]{10,11}$/
  return re.test(phone.replace(/\D/g, ''))
}

export const generateColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ]
  
  return colors[Math.abs(hash) % colors.length]
}