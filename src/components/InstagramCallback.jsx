import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertCircle, FiCheck, FiLoader } = FiIcons

const InstagramCallback = () => {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error = params.get('error')

        if (code) {
          // Successfully received auth code
          setStatus('success')
          // Redirect back to main page with code
          setTimeout(() => {
            navigate(`/?code=${code}`)
          }, 1500)
        } else if (error) {
          // Handle error from Instagram
          setStatus('error')
          setError(error)
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          // No code or error found
          setStatus('error')
          setError('No authorization code received')
          setTimeout(() => {
            navigate('/')
          }, 3000)
        }
      } catch (err) {
        setStatus('error')
        setError(err.message)
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    }

    processCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Processing Instagram Login...
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the authentication process.
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
              You have successfully connected your Instagram account. Redirecting...
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