import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCamera, FiLogOut, FiUsers, FiUserPlus, FiAward } = FiIcons

const UserProfile = ({ user, onDisconnect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Instagram Business Profile</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDisconnect}
          className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
        >
          <SafeIcon icon={FiLogOut} className="text-sm" />
          <span className="text-sm">Disconnect</span>
        </motion.button>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        <div className="flex-shrink-0">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-r from-purple-500 to-pink-500"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="text-white text-2xl" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-gray-900 truncate">
            @{user.username}
          </h3>
          {user.name && (
            <p className="text-lg text-gray-700 truncate">{user.name}</p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <SafeIcon icon={FiAward} className="text-purple-500 text-sm" />
            <span className="text-sm text-gray-600 capitalize">
              {user.account_type || 'Business'} Account
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center">
          <SafeIcon icon={FiCamera} className="text-gray-500 mb-2" />
          <span className="text-xl font-bold text-gray-900">
            {user.media_count || 0}
          </span>
          <span className="text-sm text-gray-600">Posts</span>
        </div>
        <div className="flex flex-col items-center">
          <SafeIcon icon={FiUsers} className="text-gray-500 mb-2" />
          <span className="text-xl font-bold text-gray-900">
            {user.followers_count ? user.followers_count.toLocaleString() : '--'}
          </span>
          <span className="text-sm text-gray-600">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <SafeIcon icon={FiUserPlus} className="text-gray-500 mb-2" />
          <span className="text-xl font-bold text-gray-900">
            {user.follows_count ? user.follows_count.toLocaleString() : '--'}
          </span>
          <span className="text-sm text-gray-600">Following</span>
        </div>
      </div>
    </motion.div>
  )
}

export default UserProfile