// Instagram API configuration - Updated with new scopes
const INSTAGRAM_APP_ID = '1413379789860625'
const INSTAGRAM_CLIENT_SECRET = 'e1be236ec20e1c5e154f094b09dbac84'
export const REDIRECT_URI = window.location.origin + '/#/auth/instagram/callback'
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize'

// Log the configuration for debugging
console.log('Instagram Config:', {
  INSTAGRAM_APP_ID,
  REDIRECT_URI,
  INSTAGRAM_AUTH_URL
})

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

// Real Instagram OAuth redirect with NEW SCOPES
export const redirectToInstagramAuth = (returnUrl = '/') => {
  const state = generateState()
  
  // Store state and return URL for callback
  setPreAuthState({
    state,
    returnUrl,
    timestamp: Date.now()
  })
  
  // Build the Instagram authorization URL with NEW SCOPES
  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: REDIRECT_URI,
    // ✅ UPDATED: Using new scopes that are not deprecated
    scope: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments',
    response_type: 'code',
    state: state
  })
  
  console.log('🔄 Redirecting to Instagram with new scopes:', params.get('scope'))
  
  // Redirect to Instagram for authorization
  window.location.href = `${INSTAGRAM_AUTH_URL}?${params.toString()}`
}

// Real token exchange function - uses serverless function
export const exchangeCodeForToken = async (code) => {
  try {
    console.log('🔄 Exchanging code for token:', code.substring(0, 10) + '...')
    
    // Call our serverless function to exchange the code for a token
    const response = await fetch('/.netlify/functions/instagram-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to exchange code for token')
    }
    
    const result = await response.json()
    console.log('✅ Token exchange successful for user:', result.user?.username)
    
    return result
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error)
    throw error
  }
}

// Validate access token
export const validateToken = async (accessToken) => {
  try {
    console.log('🔄 Validating token:', accessToken.substring(0, 10) + '...')
    
    // Simple validation by trying to fetch user data
    const response = await fetch(`https://graph.instagram.com/me?fields=id&access_token=${accessToken}`)
    const data = await response.json()
    
    const isValid = !data.error
    console.log(isValid ? '✅ Token is valid' : '❌ Token is invalid:', data.error?.message)
    
    return isValid
  } catch (error) {
    console.error('❌ Error validating token:', error)
    return false
  }
}

// Refresh access token
export const refreshAccessToken = async (accessToken) => {
  try {
    console.log('🔄 Refreshing access token:', accessToken.substring(0, 10) + '...')
    
    // Call our serverless function to refresh the token
    const response = await fetch('/.netlify/functions/instagram-refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to refresh token')
    }
    
    const result = await response.json()
    console.log('✅ Token refresh successful, expires in:', result.expires_in)
    
    return result
  } catch (error) {
    console.error('❌ Error refreshing token:', error)
    throw error
  }
}

// Get user media with enhanced fields for new scopes
export const getUserMedia = async (accessToken, limit = 25) => {
  try {
    console.log('🔄 Fetching user media with enhanced fields...')
    
    // Enhanced fields available with new scopes
    const mediaFields = [
      'id',
      'caption', 
      'media_type',
      'media_url',
      'thumbnail_url',
      'timestamp',
      'permalink',
      'like_count',
      'comments_count',
      'is_comment_enabled',
      'media_product_type'
    ].join(',')
    
    const params = new URLSearchParams({
      fields: mediaFields,
      access_token: accessToken,
      limit: limit.toString()
    })
    
    const response = await fetch(`https://graph.instagram.com/me/media?${params}`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || data.error)
    }
    
    console.log(`✅ Retrieved ${data.data?.length || 0} media items`)
    return data.data || []
  } catch (error) {
    console.error('❌ Error fetching user media:', error)
    throw error
  }
}

// Get user profile with enhanced fields for new scopes
export const getUserProfile = async (accessToken) => {
  try {
    console.log('🔄 Fetching user profile with enhanced fields...')
    
    // Enhanced fields available with new scopes
    const profileFields = [
      'id',
      'username',
      'name',
      'account_type',
      'media_count',
      'profile_picture_url',
      'followers_count',
      'follows_count',
      'biography',
      'website'
    ].join(',')
    
    const params = new URLSearchParams({
      fields: profileFields,
      access_token: accessToken
    })
    
    const response = await fetch(`https://graph.instagram.com/me?${params}`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || data.error)
    }
    
    console.log('✅ Retrieved profile for user:', data.username)
    return data
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    throw error
  }
}