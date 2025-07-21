import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiImage, FiUsers, FiHeart, FiMessageCircle } = FiIcons

const UserDetails = () => {
  // Mock user data
  const userData = {
    username: "instagram_user",
    name: "Instagram User",
    followers: 1234,
    following: 567,
    posts: 42,
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="flex-shrink-0">
              <img
                src={userData.profileImage}
                alt={userData.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">@{userData.username}</h1>
              <p className="text-gray-600">{userData.name}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <SafeIcon icon={FiImage} className="text-purple-500 text-xl mb-2 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">{userData.posts}</div>
              <div className="text-gray-600 text-sm">Posts</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <SafeIcon icon={FiUsers} className="text-purple-500 text-xl mb-2 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">{userData.followers}</div>
              <div className="text-gray-600 text-sm">Followers</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <SafeIcon icon={FiUsers} className="text-purple-500 text-xl mb-2 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">{userData.following}</div>
              <div className="text-gray-600 text-sm">Following</div>
            </div>
          </div>

          {/* Engagement Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Engagement</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiHeart} className="text-red-500" />
                <div>
                  <div className="text-gray-600 text-sm">Average Likes</div>
                  <div className="text-lg font-semibold text-gray-900">1.2K</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMessageCircle} className="text-blue-500" />
                <div>
                  <div className="text-gray-600 text-sm">Average Comments</div>
                  <div className="text-lg font-semibold text-gray-900">84</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UserDetails