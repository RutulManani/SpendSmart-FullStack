import React, { useEffect, useState, useCallback } from 'react'
import api from '../../services/api'
import {
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  Award,
  Target,
  X,
  Save
} from 'lucide-react'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = async user => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleEditUser = user => {
    setEditingUser(user._id)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
      preferences: user.preferences || {}
    })
  }

  const handleSaveEdit = async userId => {
    setSaving(true)
    try {
      const { data } = await api.put(`/admin/users/${userId}`, editForm)
      setUsers(prev =>
        prev.map(user => (user._id === userId ? data.user : user))
      )
      setEditingUser(null)
      setEditForm({})
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone and will delete all their data.`
      )
    ) {
      return
    }

    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(prev => prev.filter(user => user._id !== userId))
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null)
        setShowUserDetails(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'totalSpent':
          aValue = a.totalSpent || 0
          bValue = b.totalSpent || 0
          break
        case 'completedChallenges':
          aValue = a.completedChallenges || 0
          bValue = b.completedChallenges || 0
          break
        case 'badgeCount':
          aValue = a.badgeCount || 0
          bValue = b.badgeCount || 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0)
  }

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = role => {
    return role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='text-white'>Loading users...</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h3 className='text-xl text-white font-semibold mb-2'>
            User Management
          </h3>
          <p className='text-[#A9A9A9]'>
            Manage all SpendSmart users and their data
          </p>
        </div>
        <div className='text-white bg-[#3D3D3D] px-3 py-1 rounded-full border border-[#444]'>
          Total Users: {users.length}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400'>
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className='bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]' />
            <input
              type='text'
              placeholder='Search users...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-[#2b2b2b] border border-[#444] text-white rounded focus:outline-none focus:border-[#B7FF00]'
            />
          </div>

          {/* Role Filter */}
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A9A9A9]' />
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-[#2b2b2b] border border-[#444] text-white rounded focus:outline-none focus:border-[#B7FF00] appearance-none'
            >
              <option value='all'>All Roles</option>
              <option value='user'>Users</option>
              <option value='admin'>Admins</option>
            </select>
          </div>

          {/* Sort */}
          <div className='relative'>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setSortBy(sortBy)
                setSortOrder(sortOrder)
              }}
              className='w-full pl-4 pr-4 py-2 bg-[#2b2b2b] border border-[#444] text-white rounded focus:outline-none focus:border-[#B7FF00] appearance-none'
            >
              <option value='createdAt-desc'>Newest First</option>
              <option value='createdAt-asc'>Oldest First</option>
              <option value='name-asc'>Name A-Z</option>
              <option value='name-desc'>Name Z-A</option>
              <option value='totalSpent-desc'>Most Spent</option>
              <option value='totalSpent-asc'>Least Spent</option>
              <option value='completedChallenges-desc'>Most Challenges</option>
              <option value='badgeCount-desc'>Most Badges</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2b2b2b] border-b border-[#444]'>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  User
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Role
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Spending
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Challenges
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Badges
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Joined
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-[#A9A9A9]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[#333]'>
              {filteredUsers.map(user => (
                <tr
                  key={user._id}
                  className='hover:bg-[#2b2b2b] transition-colors'
                >
                  {/* User Info */}
                  <td className='px-4 py-3'>
                    {editingUser === user._id ? (
                      <div className='space-y-2'>
                        <input
                          type='text'
                          value={editForm.name}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              name: e.target.value
                            }))
                          }
                          className='w-full p-2 bg-[#3D3D3D] border border-[#444] text-white rounded text-sm'
                        />
                        <input
                          type='email'
                          value={editForm.email}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              email: e.target.value
                            }))
                          }
                          className='w-full p-2 bg-[#3D3D3D] border border-[#444] text-white rounded text-sm'
                        />
                      </div>
                    ) : (
                      <div>
                        <div className='font-medium text-white'>
                          {user.name}
                        </div>
                        <div className='text-sm text-[#A9A9A9]'>
                          {user.email}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Role */}
                  <td className='px-4 py-3'>
                    {editingUser === user._id ? (
                      <select
                        value={editForm.role}
                        onChange={e =>
                          setEditForm(prev => ({
                            ...prev,
                            role: e.target.value
                          }))
                        }
                        className='w-full p-2 bg-[#3D3D3D] border border-[#444] text-white rounded text-sm'
                      >
                        <option value='user'>User</option>
                        <option value='admin'>Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )} text-white`}
                      >
                        {user.role}
                      </span>
                    )}
                  </td>

                  {/* Spending */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='w-4 h-4 text-green-400' />
                      <div>
                        <div className='text-white font-medium'>
                          {formatCurrency(
                            user.totalSpent,
                            user.profile?.currency
                          )}
                        </div>
                        <div className='text-xs text-[#A9A9A9]'>
                          {user.expenseCount} expenses
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Challenges */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <Target className='w-4 h-4 text-blue-400' />
                      <div>
                        <div className='text-white font-medium'>
                          {user.completedChallenges}/{user.totalChallenges}
                        </div>
                        <div className='text-xs text-[#A9A9A9]'>
                          {user.totalChallenges > 0
                            ? Math.round(
                                (user.completedChallenges /
                                  user.totalChallenges) *
                                  100
                              ) + '%'
                            : '0%'}{' '}
                          success
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Badges */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <Award className='w-4 h-4 text-yellow-400' />
                      <span className='text-white font-medium'>
                        {user.badgeCount}
                      </span>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className='px-4 py-3 text-sm text-[#E0E0E0]'>
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      {editingUser === user._id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(user._id)}
                            disabled={saving}
                            className='p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50'
                            title='Save'
                          >
                            <Save className='w-4 h-4' />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className='p-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
                            title='Cancel'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewUser(user)}
                            className='p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                            title='View Details'
                          >
                            <Eye className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className='p-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'
                            title='Edit User'
                          >
                            <Edit2 className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.name)
                            }
                            className='p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
                            title='Delete User'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className='text-center py-12'>
            <Users className='w-12 h-12 text-[#A9A9A9] mx-auto mb-4' />
            <p className='text-[#A9A9A9]'>No users found</p>
            <p className='text-[#A9A9A9] text-sm mt-1'>
              {searchTerm || filterRole !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users in the system'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/users/${user._id}`)
      setUserDetails(data)
    } catch (err) {
      console.error('Failed to load user details:', err)
    } finally {
      setLoading(false)
    }
  }, [user._id])

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-[#2D2D2D] rounded-lg p-6'>
          <div className='text-white'>Loading user details...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#2D2D2D] rounded-lg border border-[#444] max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-[#444]'>
          <div>
            <h3 className='text-xl font-semibold text-white'>User Details</h3>
            <p className='text-[#A9A9A9]'>
              {user.name} - {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-[#A9A9A9] hover:text-white transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {userDetails && (
          <div className='p-6 space-y-6'>
            {/* Basic Info */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Profile Information
                </h4>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Name</span>
                    <span className='text-white'>{userDetails.user.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Email</span>
                    <span className='text-white'>{userDetails.user.email}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Role</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userDetails.user.role === 'admin'
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                      } text-white`}
                    >
                      {userDetails.user.role}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Age</span>
                    <span className='text-white'>
                      {userDetails.user.profile?.age || 'Not set'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Currency</span>
                    <span className='text-white'>
                      {userDetails.user.profile?.currency || 'USD'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Monthly Budget</span>
                    <span className='text-white'>
                      {formatCurrency(
                        userDetails.user.profile?.monthlyBudget,
                        userDetails.user.profile?.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Statistics
                </h4>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Total Spent</span>
                    <span className='text-white font-medium'>
                      {formatCurrency(
                        userDetails.stats.totalSpent,
                        userDetails.user.profile?.currency
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Total Expenses</span>
                    <span className='text-white'>
                      {userDetails.stats.expenseCount}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Average Expense</span>
                    <span className='text-white'>
                      {formatCurrency(
                        userDetails.stats.averageSpent,
                        userDetails.user.profile?.currency
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Completed Challenges</span>
                    <span className='text-white'>
                      {userDetails.stats.completedChallenges}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#A9A9A9]'>Total Badges</span>
                    <span className='text-white'>
                      {userDetails.user.badges?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending by Category */}
            {userDetails.stats.expensesByCategory.length > 0 && (
              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Spending by Category
                </h4>
                <div className='space-y-2'>
                  {userDetails.stats.expensesByCategory.map(category => (
                    <div
                      key={category._id}
                      className='flex justify-between items-center'
                    >
                      <span className='text-[#E0E0E0] capitalize'>
                        {category._id}
                      </span>
                      <div className='flex items-center gap-4'>
                        <span className='text-white font-medium'>
                          {formatCurrency(
                            category.total,
                            userDetails.user.profile?.currency
                          )}
                        </span>
                        <span className='text-[#A9A9A9] text-sm'>
                          ({category.count} expenses)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {userDetails.user.badges && userDetails.user.badges.length > 0 && (
              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Earned Badges
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {userDetails.user.badges.map((badge, index) => (
                    <div
                      key={index}
                      className='bg-[#3D3D3D] p-3 rounded-lg border border-[#444] text-center'
                    >
                      <Award className='w-8 h-8 text-yellow-400 mx-auto mb-2' />
                      <div className='text-white font-medium text-sm'>
                        {badge.badgeId?.name ||
                          badge.badgeId?.title ||
                          'Unknown Badge'}
                      </div>
                      <div className='text-[#A9A9A9] text-xs'>
                        {badge.earnedAt
                          ? new Date(badge.earnedAt).toLocaleDateString()
                          : 'Unknown date'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageUsers
