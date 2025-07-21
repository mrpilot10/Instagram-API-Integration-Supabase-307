import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useInstagram } from '../hooks/useInstagram'

const { FiAlertCircle, FiCheck, FiLoader } = FiIcons

const InstagramCallback = () => {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})
  const navigate = useNavigate()
  const { handleAuthCallback } = useInstagram()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the full URL for debugging
        const fullUrl = window.location.href
        console.log('📍 Full callback URL:', fullUrl)
        
        // Handle both regular params and hash fragment
        let params;
        
        // First try the search params
        params = new URLSearchParams(window.location.search)
        let code = params.get('code')
        let errorParam = params.get('error')
        
        // If code is not in search params, check if it's after a hash
        if (!code && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          code = hashParams.get('code')
          errorParam = hashParams.get('error')
          
          // If still no code, try treating the entire hash as a query string
          if (!code && window.location.hash.includes('?')) {
            const hashWithQuery = window.location.hash.substring(window.location.hash.indexOf('?'))
            params = new URLSearchParams(hashWithQuery)
            code = params.get('code')
            errorParam = params.get('error')
          }
        }
        
        // Store debug info
        setDebugInfo({
          fullUrl,
          search: window.location.search,
          hash: window.location.hash,
          code: code ? `${code.substring(0, 10)}...` : null
        })
        
        console.log('🔍 Debug info:', {
          url: window.location.href,
          search: window.location.search,
          hash: window.location.hash,
          code: code ? `${code.substring(0, 10)}...` : null
        })
        
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
              navigate('/dashboard')
            }, 1500)
          } else {
            throw new Error('Authentication failed')
          }
        } else if (errorParam) {
          // Handle error from Instagram
          console.error('❌ Instagram error:', errorParam)
          setStatus('error')
          setError(errorParam)
          
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
            <p className="text-gray-600 mb-4">
              {status === 'processing' 
                ? 'Please wait while we process your authentication request.' 
                : 'Connecting your Instagram account to our application...'}
            </p>
            <div className="flex justify-center">
              <SafeIcon icon={FiLoader} className="text-purple-500 animate-spin text-xl" />
            </div>
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
            <p className="text-gray-600 mb-6">
              Redirecting you back to the main page...
            </p>
            
            {/* Debug information for troubleshooting */}
            <div className="mt-4 text-left text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Debug Information:</p>
              <pre className="overflow-auto max-h-24 whitespace-pre-wrap break-all">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default InstagramCallback