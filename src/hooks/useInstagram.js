import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import * as instagramApi from '../services/instagramApi'

export const useInstagram = () => {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ UPDATED: Handle auth callback with server-side token exchange
  const handleAuthCallback = async (code) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Processing auth callback with code:', code.substring(0, 10) + '...')

      // Exchange code for tokens and user data via our serverless function
      const authData = await instagramApi.exchangeCodeForToken(code)
      if (!authData.success) {
        throw new Error('Authentication failed')
      }

      console.log('✅ Authentication successful:', authData.user.username)

      // Save token info to localStorage
      const tokenInfo = {
        access_token: authData.token.access_token,
        expires_at: authData.token.expires_at,
        user_id: authData.token.user_id
      }
      localStorage.setItem('instagram_token_info', JSON.stringify(tokenInfo))

      // Set state with user data and posts
      setUser(authData.user)
      setPosts(authData.posts || [])

      // Clean up URL if needed
      if (window.location.search.includes('code=')) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      return authData
    } catch (err) {
      console.error('❌ Auth callback error:', err)
      setError(err.message || 'Failed to authenticate with Instagram')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkTokenExpiration = async (tokenInfo) => {
    const expiresAt = new Date(tokenInfo.expires_at)
    const now = new Date()
    const daysUntilExpiry = (expiresAt - now) / (1000 * 60 * 60 * 24)

    // Refresh token if it expires in less than 7 days
    if (daysUntilExpiry < 7) {
      try {
        const refreshedToken = await instagramApi.refreshAccessToken(tokenInfo.access_token)
        if (!refreshedToken.success) {
          throw new Error('Token refresh failed')
        }

        const updatedTokenInfo = {
          ...tokenInfo,
          access_token: refreshedToken.access_token,
          expires_at: refreshedToken.expires_at
        }
        localStorage.setItem('instagram_token_info', JSON.stringify(updatedTokenInfo))
        return updatedTokenInfo
      } catch (error) {
        console.warn('Failed to refresh token:', error)
        return tokenInfo
      }
    }
    return tokenInfo
  }

  const loadUserData = async () => {
    const tokenInfoStr = localStorage.getItem('instagram_token_info')
    if (!tokenInfoStr) return

    try {
      setLoading(true)
      setError(null)

      let tokenInfo = JSON.parse(tokenInfoStr)

      // Check and refresh token if needed
      try {
        tokenInfo = await checkTokenExpiration(tokenInfo)

        // Validate token
        const isValid = await instagramApi.validateToken(tokenInfo.access_token)
        if (!isValid) {
          throw new Error('Token is invalid')
        }

        // Try to load from Supabase first
        const { data: userData, error: userError } = await supabase
          .from('instagram_users_x7y9z2')
          .select('*')
          .eq('instagram_id', tokenInfo.user_id)
          .single()

        if (!userError && userData) {
          const { data: postsData, error: postsError } = await supabase
            .from('instagram_posts_x7y9z2')
            .select('*')
            .eq('user_instagram_id', userData.instagram_id)
            .order('timestamp', { ascending: false })

          setUser(userData)
          setPosts(postsError ? [] : postsData)
        } else {
          // Token is valid but user data not in Supabase
          // This shouldn't happen with server-side auth, but just in case
          throw new Error('User data not found')
        }
      } catch (err) {
        throw new Error(`Failed to load data: ${err.message}`)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err.message || 'Failed to load Instagram data')
      localStorage.removeItem('instagram_token_info')
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    localStorage.removeItem('instagram_token_info')
    setUser(null)
    setPosts([])
    setError(null)
  }

  useEffect(() => {
    loadUserData()
  }, [])

  // ✅ UPDATED: Handle URL callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (code && !user) {
      console.log('✅ Found auth code in URL, processing...')
      handleAuthCallback(code)
    } else if (error) {
      console.log('❌ Found error in URL:', error)
      setError(`Instagram error: ${error}`)
    }
  }, [])

  return {
    user,
    posts,
    loading,
    error,
    handleAuthCallback,
    disconnect,
    loadUserData
  }
}