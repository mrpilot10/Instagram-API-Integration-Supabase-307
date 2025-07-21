const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Instagram App Configuration - Updated for new scopes
const INSTAGRAM_CLIENT_ID = '1413379789860625'
const INSTAGRAM_CLIENT_SECRET = 'e1be236ec20e1c5e154f094b09dbac84'
const INSTAGRAM_REDIRECT_URI = 'https://instagram-api-integration-supabase.vercel.app/auth/instagram/callback'

// Supabase Configuration
const SUPABASE_URL = 'https://cshhunwykhbgbrnxdvkk.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaGh1bnd5a2hiZ2JybnhkdmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA3NDI4MiwiZXhwIjoyMDY4NjUwMjgyfQ.qnEXg4t6iiykjQ1wNsxgcALtwk9VsM85MlFMVutl6GY'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Save user to Supabase with enhanced fields
async function saveUserToSupabase(profile, accessToken, tokenExpiresAt) {
  try {
    const userData = {
      instagram_id: profile.id,
      username: profile.username,
      name: profile.name,
      account_type: profile.account_type,
      media_count: profile.media_count,
      followers_count: profile.followers_count,
      follows_count: profile.follows_count,
      profile_picture_url: profile.profile_picture_url,
      biography: profile.biography || null,
      website: profile.website || null,
      access_token: accessToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    }
    
    const { error } = await supabase
      .from('instagram_users_x7y9z2')
      .upsert(userData, { onConflict: 'instagram_id', ignoreDuplicates: false })
    
    if (error) throw error
    
    console.log('✅ User saved to Supabase:', profile.username)
    return true
  } catch (error) {
    console.error('❌ Error saving user to Supabase:', error)
    return false
  }
}

// Save posts to Supabase with enhanced fields
async function savePostsToSupabase(userId, posts) {
  try {
    if (!posts || posts.length === 0) return true
    
    const postsData = posts.map(post => ({
      instagram_id: post.id,
      user_instagram_id: userId,
      caption: post.caption || '',
      media_type: post.media_type,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url,
      timestamp: post.timestamp,
      permalink: post.permalink,
      like_count: post.like_count,
      comments_count: post.comments_count,
      is_comment_enabled: post.is_comment_enabled,
      media_product_type: post.media_product_type,
      created_at: new Date().toISOString(),
    }))
    
    const { error } = await supabase
      .from('instagram_posts_x7y9z2')
      .upsert(postsData, { onConflict: 'instagram_id', ignoreDuplicates: false })
    
    if (error) throw error
    
    console.log(`✅ ${posts.length} posts saved to Supabase`)
    return true
  } catch (error) {
    console.error('❌ Error saving posts to Supabase:', error)
    return false
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }
  
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }
  
  try {
    // Parse request body
    const { code } = JSON.parse(event.body || '{}')
    
    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code required' })
      }
    }
    
    console.log('📝 Processing Instagram auth with code:', code.substring(0, 10) + '...')
    console.log('🔄 Using NEW Instagram Business API scopes')
    
    // ✅ UPDATED: Exchange code for short-lived access token using Instagram Business API
    console.log('🔄 Exchanging code for token...')
    const formData = new URLSearchParams()
    formData.append('client_id', INSTAGRAM_CLIENT_ID)
    formData.append('client_secret', INSTAGRAM_CLIENT_SECRET)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', INSTAGRAM_REDIRECT_URI)
    formData.append('code', code)
    
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('❌ Token exchange error:', tokenData)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Failed to exchange code for token',
          details: tokenData.error_description || tokenData.error
        })
      }
    }
    
    console.log('✅ Received short-lived token and user ID:', tokenData.user_id)
    const shortLivedToken = tokenData.access_token
    
    // ✅ UPDATED: Exchange for long-lived token (60 days) using Instagram Business API
    console.log('🔄 Getting long-lived token...')
    const longLivedParams = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: INSTAGRAM_CLIENT_SECRET,
      access_token: shortLivedToken
    })
    
    const longLivedResponse = await fetch(`https://graph.instagram.com/access_token?${longLivedParams}`)
    const longLivedData = await longLivedResponse.json()
    
    if (longLivedData.error) {
      console.error('❌ Long-lived token error:', longLivedData)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Failed to get long-lived token',
          details: longLivedData.error.message || longLivedData.error
        })
      }
    }
    
    console.log('✅ Received long-lived token with expiry:', longLivedData.expires_in)
    const accessToken = longLivedData.access_token
    
    // Calculate token expiration date (60 days from now)
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + longLivedData.expires_in)
    
    // ✅ UPDATED: Get user profile using Instagram Business API with enhanced fields
    console.log('🔄 Fetching user profile with enhanced fields...')
    const fields = [
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
    
    const profileParams = new URLSearchParams({
      fields,
      access_token: accessToken
    })
    
    const profileResponse = await fetch(`https://graph.instagram.com/me?${profileParams}`)
    const profile = await profileResponse.json()
    
    if (profile.error) {
      console.error('❌ Profile fetch error:', profile)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Failed to fetch user profile',
          details: profile.error.message || profile.error
        })
      }
    }
    
    console.log('✅ Received user profile:', profile.username)
    
    // ✅ UPDATED: Get user media using Instagram Business API with enhanced fields
    console.log('🔄 Fetching user media with enhanced fields...')
    const mediaParams = new URLSearchParams({
      fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count,is_comment_enabled,media_product_type',
      access_token: accessToken,
      limit: '25'
    })
    
    const mediaResponse = await fetch(`https://graph.instagram.com/me/media?${mediaParams}`)
    const mediaData = await mediaResponse.json()
    
    if (mediaData.error) {
      console.error('❌ Media fetch error:', mediaData)
      // Continue anyway, just log the error
    }
    
    const media = mediaData.error ? { data: [] } : mediaData
    console.log(`✅ Received ${media.data ? media.data.length : 0} media items`)
    
    // Step 5: Save to Supabase
    console.log('🔄 Saving data to Supabase...')
    await saveUserToSupabase(profile, accessToken, tokenExpiresAt.toISOString())
    
    if (media.data && media.data.length > 0) {
      await savePostsToSupabase(profile.id, media.data)
    }
    
    // Step 6: Return success response with user data and token
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: profile,
        posts: media.data || [],
        token: {
          access_token: accessToken,
          expires_at: tokenExpiresAt.toISOString(),
          user_id: profile.id
        },
        scopes_used: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments'
      })
    }
  } catch (error) {
    console.error('❌ Instagram auth error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Authentication failed',
        message: error.message
      })
    }
  }
}