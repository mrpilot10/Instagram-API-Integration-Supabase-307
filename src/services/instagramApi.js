// Instagram API configuration - Updated for Instagram Business API
const INSTAGRAM_APP_ID = '1413379789860625'
export const REDIRECT_URI = 'https://instagram-api-integration-supabase.vercel.app/auth/instagram/callback'
const INSTAGRAM_AUTH_URL = 'https://www.instagram.com/oauth/authorize'
const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com'

// Log the configuration for debugging
console.log('Instagram Config:', { INSTAGRAM_APP_ID, REDIRECT_URI, INSTAGRAM_AUTH_URL })

// Store pre-auth state for callback handling
export const setPreAuthState = (state) => {
  localStorage.setItem('instagram_pre_auth_state', JSON.stringify(state))
}

export const getPreAuthState = () => {
  const state = localStorage.getItem('instagram_pre_auth_state')
  if (state) {
    localStorage.removeItem('instagram_pre_auth_state')
    return JSON.parse(state)
  }
  return null
}

export const verifyAuthState = (receivedState) => {
  const storedState = getPreAuthState()
  return storedState && storedState.state === receivedState
}

// Generate a random state for OAuth security
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// ✅ FIXED: Redirect to Instagram OAuth with correct Business API scopes
export const redirectToInstagramAuth = (returnUrl = '/') => {
  const state = generateState()
  
  // Store state and return URL for callback
  setPreAuthState({ state, returnUrl, timestamp: Date.now() })
  
  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'instagram_business_basic', // ✅ CORRECT: Use Instagram Business API scope
    response_type: 'code',
    state: state
  })
  
  const authUrl = `${INSTAGRAM_AUTH_URL}?${params}`
  console.log('🔗 Redirecting to Instagram Business auth:', authUrl)
  window.location.href = authUrl
}

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code) => {
  try {
    console.log('🔄 Exchanging code for token via server function...')
    
    // Call our serverless function
    // Use a relative URL that works in both development and production
    const response = await fetch('/.netlify/functions/instagram-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Server response error:', response.status, errorData)
      throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Server authentication successful')
    return data
  } catch (error) {
    console.error('❌ Token exchange error:', error)
    throw error
  }
}

// Validate access token
export const validateToken = async (accessToken) => {
  try {
    const params = new URLSearchParams({ access_token: accessToken })
    const response = await fetch(`${INSTAGRAM_GRAPH_URL}/me?${params}`)
    const data = await response.json()
    return !data.error
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

// Refresh access token
export const refreshAccessToken = async (accessToken) => {
  try {
    console.log('🔄 Refreshing access token...')
    
    // Call our serverless function
    const response = await fetch('/.netlify/functions/instagram-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Token refresh failed')
    }
    
    const data = await response.json()
    console.log('✅ Token refresh successful')
    return data
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    throw error
  }
}

// Get user media directly from Instagram (fallback only)
export const getUserMedia = async (accessToken, limit = 25) => {
  try {
    const params = new URLSearchParams({
      fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink',
      access_token: accessToken,
      limit: limit.toString()
    })
    
    const response = await fetch(`${INSTAGRAM_GRAPH_URL}/me/media?${params}`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || data.error)
    }
    
    return data
  } catch (error) {
    console.error('Get user media error:', error)
    throw error
  }
}

// Get user profile directly from Instagram (fallback only)
export const getUserProfile = async (accessToken) => {
  try {
    const fields = [
      'id', 'username', 'account_type', 'media_count'
    ].join(',')
    
    const params = new URLSearchParams({
      fields,
      access_token: accessToken
    })
    
    const response = await fetch(`${INSTAGRAM_GRAPH_URL}/me?${params}`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || data.error)
    }
    
    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}