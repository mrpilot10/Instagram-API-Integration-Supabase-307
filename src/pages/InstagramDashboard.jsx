import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useInstagram } from '../hooks/useInstagram'

const { 
  FiUser, FiImage, FiVideo, FiHeart, FiMessageCircle, 
  FiCalendar, FiExternalLink, FiRefreshCw, FiLogOut,
  FiCamera, FiUsers, FiUserPlus, FiAward, FiInfo,
  FiAlertCircle, FiWifi, FiWifiOff
} = FiIcons

const InstagramDashboard = () => {
  const { 
    user, 
    posts, 
    loading, 
    error, 
    disconnect, 
    loadUserData 
  } = useInstagram()
  const navigate = useNavigate()

  // If no user is logged in, redirect to main page
  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleRefresh = async () => {
    await loadUserData()
  }

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Instagram Data...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your latest information
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiAlertCircle} className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Error Loading Data
          </h2>
          <p className="text-red-600 mb-6">
            {error || 'An error occurred while loading your Instagram data'}
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiRefreshCw} />
                <span>Try Again</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiLogOut} />
                <span>Back to Home</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">Instagram Dashboard</h1>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <SafeIcon icon={FiRefreshCw} className="text-gray-600" />
              <span className="text-gray-700">Refresh</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisconnect}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
            >
              <SafeIcon icon={FiLogOut} className="text-red-600" />
              <span>Disconnect</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile */}
            <UserProfileCard user={user} />
            
            {/* Account Stats */}
            <StatsCard user={user} posts={posts} />
            
            {/* Connection Info */}
            <ConnectionInfoCard />
          </div>
          
          {/* Right Column - Posts Grid */}
          <div className="lg:col-span-8">
            <PostsGrid posts={posts} />
          </div>
        </div>
      </div>
    </div>
  )
}

// User Profile Component
const UserProfileCard = ({ user }) => {
  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center space-x-4 mb-6">
        {user.profile_picture_url ? (
          <img 
            src={user.profile_picture_url} 
            alt={user.username} 
            className="w-20 h-20 rounded-full object-cover border-4 border-purple-100"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiUser} className="text-white text-2xl" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">@{user.username}</h2>
          {user.name && <p className="text-gray-600">{user.name}</p>}
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <SafeIcon icon={FiAward} className="text-purple-500 mr-1" />
            <span className="capitalize">{user.account_type || 'Business'} Account</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex flex-col items-center">
            <SafeIcon icon={FiCamera} className="text-purple-500 mb-2" />
            <span className="text-xl font-bold text-gray-900">
              {user.media_count || 0}
            </span>
            <span className="text-sm text-gray-600">Posts</span>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex flex-col items-center">
            <SafeIcon icon={FiUsers} className="text-purple-500 mb-2" />
            <span className="text-xl font-bold text-gray-900">
              {user.followers_count ? user.followers_count.toLocaleString() : 0}
            </span>
            <span className="text-sm text-gray-600">Followers</span>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex flex-col items-center">
            <SafeIcon icon={FiUserPlus} className="text-purple-500 mb-2" />
            <span className="text-xl font-bold text-gray-900">
              {user.follows_count ? user.follows_count.toLocaleString() : 0}
            </span>
            <span className="text-sm text-gray-600">Following</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Stats Card Component
const StatsCard = ({ user, posts }) => {
  if (!user) return null
  
  // Calculate engagement rate
  const calculateEngagementRate = () => {
    if (!posts || posts.length === 0 || !user.followers_count) return 0
    
    const totalEngagements = posts.reduce((sum, post) => {
      return sum + (post.like_count || 0) + (post.comments_count || 0)
    }, 0)
    
    const avgEngagements = totalEngagements / posts.length
    return (avgEngagements / user.followers_count) * 100
  }
  
  const engagementRate = calculateEngagementRate().toFixed(2)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Account Insights</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <SafeIcon icon={FiHeart} className="text-red-500 mr-2" />
            <span className="text-gray-700">Avg. Likes per Post</span>
          </div>
          <span className="font-semibold text-gray-900">
            {posts && posts.length > 0
              ? Math.round(
                  posts.reduce((sum, post) => sum + (post.like_count || 0), 0) / posts.length
                ).toLocaleString()
              : '0'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="text-blue-500 mr-2" />
            <span className="text-gray-700">Avg. Comments</span>
          </div>
          <span className="font-semibold text-gray-900">
            {posts && posts.length > 0
              ? Math.round(
                  posts.reduce((sum, post) => sum + (post.comments_count || 0), 0) / posts.length
                ).toLocaleString()
              : '0'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <SafeIcon icon={FiUsers} className="text-purple-500 mr-2" />
            <span className="text-gray-700">Engagement Rate</span>
          </div>
          <span className="font-semibold text-gray-900">
            {engagementRate}%
          </span>
        </div>
        
        {user.token_expires_at && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <SafeIcon icon={FiCalendar} className="text-orange-500 mr-2" />
              <span className="text-gray-700">Token Expires</span>
            </div>
            <span className="font-semibold text-gray-900">
              {format(new Date(user.token_expires_at), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Connection Info Component
const ConnectionInfoCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiInfo} className="text-blue-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-900">Connection Info</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center text-green-600">
          <SafeIcon icon={FiWifi} className="mr-2" />
          <span>Connected to Instagram Business API</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <SafeIcon icon={FiUsers} className="mr-2" />
          <span>Data stored in Supabase</span>
        </div>
        
        <p className="text-gray-500 text-xs mt-4">
          Your Instagram access token is refreshed automatically to maintain connection.
        </p>
      </div>
    </motion.div>
  )
}

// Posts Grid Component
const PostsGrid = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 text-center h-full flex flex-col justify-center"
      >
        <SafeIcon icon={FiImage} className="text-gray-400 text-5xl mb-4 mx-auto" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Your Instagram posts will appear here once loaded. If you've just connected your account, try refreshing the data.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <SafeIcon icon={FiCamera} className="text-purple-500 mr-2" />
        <span>Recent Posts ({posts.length})</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-square relative">
              {post.media_type === 'VIDEO' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <SafeIcon icon={FiVideo} className="text-gray-500 text-3xl" />
                </div>
              ) : (
                <img
                  src={post.media_url || post.thumbnail_url}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              )}
              <div
                className="w-full h-full hidden items-center justify-center bg-gray-200"
              >
                <SafeIcon icon={FiImage} className="text-gray-500 text-3xl" />
              </div>
              
              <div className="absolute top-3 right-3">
                <div className="bg-black bg-opacity-50 rounded-full p-1">
                  <SafeIcon
                    icon={post.media_type === 'VIDEO' ? FiVideo : FiImage}
                    className="text-white text-sm"
                  />
                </div>
              </div>
              
              {post.permalink && (
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 transition-all"
                >
                  <SafeIcon icon={FiExternalLink} className="text-white text-sm" />
                </a>
              )}
            </div>
            
            <div className="p-4">
              {post.caption && (
                <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                  {post.caption}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiHeart} />
                    <span>{post.like_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiMessageCircle} />
                    <span>{post.comments_count || 0}</span>
                  </div>
                </div>
                
                {post.timestamp && (
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiCalendar} />
                    <span>{format(new Date(post.timestamp), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default InstagramDashboard