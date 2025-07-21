import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiImage, FiVideo, FiCalendar, FiHeart, FiMessageCircle, FiExternalLink } = FiIcons

const PostsGrid = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <SafeIcon icon={FiImage} className="text-gray-400 text-4xl mb-4 mx-auto" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-600">Your Instagram posts will appear here once loaded.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
              <div className="w-full h-full hidden items-center justify-center bg-gray-200">
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
                <div className="absolute top-3 left-3">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 transition-all"
                  >
                    <SafeIcon icon={FiExternalLink} className="text-white text-sm" />
                  </a>
                </div>
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
    </div>
  )
}

export default PostsGrid