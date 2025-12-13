import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import UserManager from './pages/Admin/UserManager'
import MealManager from './pages/Admin/MealManager'
import Stats from './pages/Admin/Stats'
import UnitManager from './pages/Admin/UnitManager'
import SystemConfig from './pages/Admin/SystemConfig'
import MealRegister from './pages/Soldier/MealRegister'
import MealStats from './pages/Soldier/MealStats'
import Profile from './pages/Soldier/Profile'
import NotFound from './pages/NotFound'
import PrivateRoute from './components/PrivateRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/login',
    element: <Login />
  },
  
  // Admin Routes
  {
    path: '/admin',
    element: (
      <PrivateRoute role="admin">
        <AdminDashboard />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute role="admin">
        <UserManager />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/meals',
    element: (
      <PrivateRoute role="admin">
        <MealManager />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/stats',
    element: (
      <PrivateRoute role="admin">
        <Stats />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/units',
    element: (
      <PrivateRoute role="admin">
        <UnitManager />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/config',
    element: (
      <PrivateRoute role="admin">
        <SystemConfig />
      </PrivateRoute>
    )
  },
  
  // Soldier Routes
  {
    path: '/soldier',
    element: (
      <PrivateRoute role="soldier">
        <MealRegister />
      </PrivateRoute>
    )
  },
  {
    path: '/soldier/stats',
    element: (
      <PrivateRoute role="soldier">
        <MealStats />
      </PrivateRoute>
    )
  },
  {
    path: '/soldier/profile',
    element: (
      <PrivateRoute role="soldier">
        <Profile />
      </PrivateRoute>
    )
  },
  
  // 404 Page
  {
    path: '*',
    element: <NotFound />
  }
])