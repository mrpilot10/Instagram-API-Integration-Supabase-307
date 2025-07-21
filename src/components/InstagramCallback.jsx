import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useInstagram } from '../hooks/useInstagram'

const { FiAlertCircle, FiCheck } = FiIcons

const InstagramCallback = () => {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { handleAuthCallback } = useInstagram()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get URL parameters - handle both hash and search parameters
        const params = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'))
        const code = params.get('code')
        const error = params.get('error')

        if (code) {
          // Successfully received auth code
          console.log('✅ Instagram Authorization Code:', code.substring(0, 10) + '...')
          
          // Exchange code for token using our hook
          setStatus('exchanging')
          const result = await handleAuthCallback(code)
          
          if (result && result.success) {
            setStatus('success')
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
              // Redirect to dashboard page
              navigate('/dashboard')
            }, 1500)
          } else {
            throw new Error('Authentication failed')
          }
        } else if (error) {
          // Handle error from Instagram
          console.error('❌ Instagram error:', error)
          setStatus('error')
          setError(error)
          
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          // No code or error found
          console.error('❌ No code or error parameter found')
          setStatus('error')
          setError('No authorization code received')
          
          setTimeout(() => {
            navigate('/')
          }, 3000)
        }
      } catch (err) {
        console.error('❌ Callback processing error:', err)
        setStatus('error')
        setError(err.message)
        
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    }

    processCallback()
  }, [navigate, handleAuthCallback])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        {(status === 'processing' || status === 'exchanging') && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {status === 'processing' ? 'Processing Instagram Login...' : 'Exchanging Authorization Code...'}
            </h2>
            <p className="text-gray-600">
              {status === 'processing' 
                ? 'Please wait while we process your authentication request.' 
                : 'Connecting your Instagram account to our application...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiCheck} className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Authentication Successful
            </h2>
            <p className="text-gray-600">
              You have successfully connected your Instagram account. Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiAlertCircle} className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Authentication Failed
            </h2>
            <p className="text-red-600 mb-3">
              {error || 'An error occurred during Instagram authentication'}
            </p>
            <p className="text-gray-600">
              Redirecting you back to the main page...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default InstagramCallback