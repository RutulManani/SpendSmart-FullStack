// client/src/components/Layout/Header.js
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, Menu, X, Home } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogoutSuccess(true)
    setIsProfileMenuOpen(false)

    // Show success message for 2 seconds before redirecting
    setTimeout(() => {
      setShowLogoutSuccess(false)
      navigate('/')
    }, 2000)
  }

  const isActive = path => location.pathname === path

  const items = [{ path: '/dashboard', label: 'Dashboard', icon: Home }]

  return (
    <header className='bg-[#1E1E1E] border-b border-[#444] sticky top-0 z-50'>
      {/* Logout Success Message */}
      {showLogoutSuccess && (
        <div className='bg-green-900/20 border-b border-green-500 py-3'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-center gap-2'>
              <svg
                className='w-4 h-4 text-green-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-green-400 text-sm font-medium'>
                Logout successful! Redirecting to home page...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <Link to='/' className='flex-shrink-0'>
              <img
                src='/images/logo.png'
                alt='SpendSmart Logo'
                className='h-8 w-auto'
              />
            </Link>
          </div>

          {user && (
            <>
              <nav className='hidden md:flex space-x-8'>
                {items.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'border-[#B7FF00] text-white'
                        : 'border-transparent text-[#A9A9A9] hover:text-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-4 h-4 mr-2' />
                    {label}
                  </Link>
                ))}

                {user.role === 'admin' && (
                  <Link
                    to='/admin'
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'border-[#B7FF00] text-lime-300'
                        : 'border-transparent text-lime-300/80 hover:text-lime-300 hover:border-[#B7FF00]'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>

              <div className='hidden md:flex items-center space-x-4'>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className='text-white bg-[#2D2D2D] px-3 py-1 rounded-full border border-[#444] inline-flex items-center gap-2'
                >
                  <User className='w-4 h-4' />
                  <span className='text-sm'>{user?.name || 'Profile'}</span>
                </button>
                {isProfileMenuOpen && (
                  <div className='absolute mt-12 right-8 bg-[#2D2D2D] border border-[#444] rounded-lg p-2'>
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setIsProfileMenuOpen(false)
                      }}
                      className='flex items-center gap-2 px-3 py-2 text-[#A9A9A9] hover:text-white w-full text-left'
                    >
                      <User className='w-4 h-4' /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className='flex items-center gap-2 px-3 py-2 text-[#A9A9A9] hover:text-white w-full text-left'
                    >
                      <LogOut className='w-4 h-4' /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <div className='hidden md:flex items-center gap-4'>
              <Link to='/login' className='text-[#A9A9A9] hover:text-white'>
                Login
              </Link>
              <Link to='/register' className='text-[#B7FF00]'>
                Sign Up
              </Link>
            </div>
          )}

          <button
            className='md:hidden text-white'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
