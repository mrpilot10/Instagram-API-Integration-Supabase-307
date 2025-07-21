import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { redirectToInstagramAuth } from '../services/instagramApi'

const { FiInstagram, FiUser, FiImage, FiUsers, FiMessageCircle } = FiIcons

const InstagramPage = () => {
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    setLoading(true)
    console.log('🎯 Instagram Business Connect button clicked!')
    redirectToInstagramAuth()
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
          Connect your Instagram Business or Creator account to manage your presence
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiUser} className="text-purple-500 flex-shrink-0" />
          <span>Access your business profile information</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiImage} className="text-purple-500 flex-shrink-0" />
          <span>View and manage your content</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <SafeIcon icon={FiMessageCircle} className="text-purple-500 flex-shrink-0" />
          <span>Access engagement metrics</span>
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
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <SafeIcon icon={FiInstagram} className="text-xl" />
            <span>Connect Instagram Business Account</span>
          </>
        )}
      </motion.button>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          ✅ Uses Instagram Business API with proper scopes
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Requires Instagram Business or Creator account
        </p>
      </div>
    </motion.div>
  )
}

export default InstagramPage