import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { verifyAuthState, getPreAuthState } from '../services/instagramApi'

const { FiAlertCircle, FiCheck, FiLoader } = FiIcons

const InstagramCallback = () => {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 Instagram Callback Component Mounted')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', window.location.search)
    console.log('Hash:', window.location.hash)

    // ✅ WORKING: Handle callback parameters
    const processCallback = async () => {
      try {
        // Get URL parameters
        let params
        try {
          // Handle both direct URL params and hash fragment params
          if (window.location.search) {
            params = new URLSearchParams(window.location.search)
            console.log('Using search params')
          } else if (window.location.hash && window.location.hash.includes('?')) {
            params = new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf('?')))
            console.log('Using hash params')
          } else {
            params = new URLSearchParams()
            console.log('No params found')
          }
        } catch (e) {
          console.error('Error parsing URL parameters:', e)
          params = new URLSearchParams()
        }

        const code = params.get('code')
        const error = params.get('error')
        const state = params.get('state')
        const errorReason = params.get('error_reason')
        const errorDescription = params.get('error_description')

        console.log('📋 Callback Parameters:', {
          code: code ? `${code.substring(0, 10)}...` : null,
          error,
          state: state ? `${state.substring(0, 10)}...` : null,
          errorReason,
          errorDescription
        })

        // Get the pre-auth state if available
        const preAuthState = getPreAuthState()
        const returnUrl = preAuthState?.returnUrl || '/'

        console.log('🔙 Return URL:', returnUrl)

        // Handle the authentication result
        if (code) {
          console.log('✅ Authorization code received, processing...')
          setStatus('success')
          
          // ✅ WORKING: Pass code back to main page for processing
          setTimeout(() => {
            navigate(`${returnUrl}?code=${code}`)
          }, 1500)
        } else if (error) {
          console.error('❌ Instagram returned error:', { error, errorReason, errorDescription })
          
          // Show error and redirect after a delay
          setStatus('error')
          setError(errorDescription || error || 'Instagram authentication failed')
          
          setTimeout(() => {
            navigate(`${returnUrl}?error=${error}`)
          }, 3000)
        } else {
          console.error('❌ No code or error found in callback')
          
          // No code or error found
          setStatus('error')
          setError('No authentication code or error received from Instagram')
          
          setTimeout(() => {
            navigate(returnUrl)
          }, 3000)
        }
      } catch (err) {
        console.error('❌ Callback processing error:', err)
        setStatus('error')
        setError('Failed to process Instagram callback')
        
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