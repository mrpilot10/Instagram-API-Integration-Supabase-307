import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiInstagram, FiUser, FiImage, FiUsers, FiMessageCircle } = FiIcons

const InstagramPage = () => {
  const navigate = useNavigate()

  const handleConnect = () => {
    // Simply navigate to user details page
    navigate('/user-details')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
          <SafeIcon icon={FiInstagram} className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Instagram Business
        </h1>
        <p className="text-gray-600">
          Connect your Instagram Business or Creator account
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiUser} className="text-purple-500 flex-shrink-0" />
          <span>View profile information</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiImage} className="text-purple-500 flex-shrink-0" />
          <span>View your content</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiMessageCircle} className="text-purple-500 flex-shrink-0" />
          <span>View engagement metrics</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiUsers} className="text-purple-500 flex-shrink-0" />
          <span>View followers and insights</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <SafeIcon icon={FiInstagram} className="text-xl" />
        <span>View Instagram Details</span>
      </motion.button>
    </motion.div>
  )
}

export default InstagramPage