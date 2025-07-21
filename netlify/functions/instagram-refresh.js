const fetch = require('node-fetch')
const { createClient } = require('@supabase/supabase-js')

// Instagram App Configuration
const INSTAGRAM_CLIENT_SECRET = 'e1be236ec20e1c5e154f094b09dbac84'

// Supabase Configuration
const SUPABASE_URL = 'https://cshhunwykhbgbrnxdvkk.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaGh1bnd5a2hiZ2JybnhkdmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA3NDI4MiwiZXhwIjoyMDY4NjUwMjgyfQ.qnEXg4t6iiykjQ1wNsxgcALtwk9VsM85MlFMVutl6GY'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
    const { access_token } = JSON.parse(event.body || '{}')
    
    if (!access_token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Access token required' })
      }
    }

    console.log('🔄 Refreshing Instagram access token...')

    // Refresh the access token
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: access_token
    })

    const response = await fetch(`https://graph.instagram.com/refresh_access_token?${params}`)
    const data = await response.json()

    if (data.error) {
      console.error('❌ Token refresh error:', data)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to refresh token',
          details: data.error.message || data.error
        })
      }
    }

    console.log('✅ Token refreshed successfully, expires in:', data.expires_in)
    
    // Calculate new expiration date
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + data.expires_in)

    // Update token in Supabase
    try {
      // Find user by access token
      const { data: userData, error: findError } = await supabase
        .from('instagram_users_x7y9z2')
        .select('instagram_id')
        .eq('access_token', access_token)
        .single()

      if (!findError && userData) {
        // Update the token
        const { error: updateError } = await supabase
          .from('instagram_users_x7y9z2')
          .update({
            access_token: data.access_token,
            token_expires_at: tokenExpiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('instagram_id', userData.instagram_id)

        if (updateError) {
          console.error('❌ Error updating token in database:', updateError)
        } else {
          console.log('✅ Token updated in database for user:', userData.instagram_id)
        }
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
    }

    // Return the new token info
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        access_token: data.access_token,
        expires_in: data.expires_in,
        expires_at: tokenExpiresAt.toISOString()
      })
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Token refresh failed',
        message: error.message 
      })
    }
  }
}