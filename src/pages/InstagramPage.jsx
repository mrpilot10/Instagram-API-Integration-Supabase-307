import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInstagram } from '../hooks/useInstagram'
import InstagramLogin from '../components/InstagramLogin'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { REDIRECT_URI } from '../services/instagramApi'

const { FiAlertCircle, FiRefreshCw, FiInfo, FiWifi, FiWifiOff, FiCheckCircle } = FiIcons

const InstagramPage = () => {
  const { user, loading, error, handleAuthCallback } = useInstagram()
  const [showConfigInfo, setShowConfigInfo] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('unknown')
  const navigate = useNavigate()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Check internet connection
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('online')
      } else {
        setConnectionStatus('offline')
      }
    }

    // Initial check
    checkConnection()

    // Set up listeners for connection changes
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)

    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  // Handle code param at the root URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    console.log('URL Params:', { code: code ? 'present' : 'not found', error })

    // Process the code if present (Instagram redirects here now)
    if (code) {
      console.log('Instagram authorization code detected')
      handleAuthCallback(code).then(() => {
        // Navigate to dashboard on successful auth
        navigate('/dashboard')
      }).catch(err => {
        console.error('Failed to process auth code:', err)
      })
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      console.log('Instagram error detected:', error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [handleAuthCallback, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Instagram Business Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your Instagram Business or Creator account using the new Instagram Business API
          </p>
        </motion.div>

        {/* Connection Status */}
        {connectionStatus === 'offline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3"
          >
            <SafeIcon icon={FiWifiOff} className="text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800">You're offline</h3>
              <p className="text-yellow-700 text-sm">
                Please check your internet connection and try again.
              </p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
          >
            <SafeIcon icon={FiAlertCircle} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Connection Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('Failed to fetch') && (
                <div className="mt-2 text-sm text-red-700">
                  <p className="font-medium">Possible causes:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Instagram API may be temporarily unavailable</li>
                    <li>There may be CORS restrictions</li>
                    <li>Network connectivity issues</li>
                    <li>App may need to use Instagram Business API scopes</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="text-lg" />
            </button>
          </motion.div>
        )}

        {!user && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            {/* Updated Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <SafeIcon icon={FiCheckCircle} className="text-green-500 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <h3 className="text-md font-semibold text-green-800">Fixed: Using Instagram Business API</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Now using the correct <code>instagram_business_basic</code> scope instead of the deprecated Basic Display API.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <SafeIcon icon={FiInfo} className="text-blue-500 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <h3 className="text-md font-semibold text-blue-800">Configuration Requirements</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    To use Instagram Business integration, ensure your Instagram app is properly configured:
                  </p>
                  <button
                    onClick={() => setShowConfigInfo(!showConfigInfo)}
                    className="text-blue-600 text-sm mt-1 hover:text-blue-800 underline"
                  >
                    {showConfigInfo ? "Hide details" : "Show details"}
                  </button>
                  {showConfigInfo && (
                    <div className="mt-3 text-sm text-blue-700">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook for Developers</a></li>
                        <li>Navigate to your app dashboard</li>
                        <li>Go to Instagram and then Basic Display (or create Instagram Login product)</li>
                        <li>
                          Under Valid OAuth Redirect URIs, add:
                          <div className="mt-1 p-2 bg-blue-100 rounded font-mono text-xs break-all">
                            {window.location.origin}
                          </div>
                          <div className="mt-1 p-2 bg-blue-100 rounded font-mono text-xs break-all">
                            {REDIRECT_URI}
                          </div>
                        </li>
                        <li>Make sure the app is in Live Mode</li>
                        <li><strong>Important:</strong> Use Instagram Business API with <code>instagram_business_basic</code> scope</li>
                        <li>Check that you've added a test user if your app is still in development</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loading && !user && (
          <div className="flex justify-center mb-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!user && !loading && (
          <div className="flex justify-center">
            <InstagramLogin loading={loading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default InstagramPage