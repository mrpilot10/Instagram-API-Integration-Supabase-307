const { createClient } = require('@supabase/supabase-js')

// Constants
const WEBHOOK_VERIFY_TOKEN = 'quest_instagram_webhook_0123456789abcdef' // This is a fallback token
const SUPABASE_URL = 'https://cshhunwykhbgbrnxdvkk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaGh1bnd5a2hiZ2JybnhkdmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA3NDI4MiwiZXhwIjoyMDY4NjUwMjgyfQ.qnEXg4t6iiykjQ1wNsxgcALtwk9VsM85MlFMVutl6GY'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Create the webhook events table if it doesn't exist
async function ensureWebhookTableExists() {
  try {
    // Check if table exists by attempting to select from it
    const { error } = await supabase
      .from('instagram_webhook_events_x7y9z2')
      .select('id')
      .limit(1)
    
    // If table doesn't exist, create it
    if (error && error.code === '42P01') {
      await supabase.rpc('create_webhook_events_table_if_not_exists', {
        table_name: 'instagram_webhook_events_x7y9z2'
      })
      
      // If the RPC function doesn't exist or fails, create the table directly
      try {
        await supabase.sql(`
          CREATE TABLE IF NOT EXISTS instagram_webhook_events_x7y9z2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT,
            object TEXT,
            entry JSONB,
            received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)
      } catch (innerError) {
        console.error('Failed to create table directly:', innerError)
      }
    }
  } catch (err) {
    console.error('Error checking/creating webhook events table:', err)
  }
}

exports.handler = async function(event, context) {
  // Log request details (useful for debugging)
  console.log('Webhook request received:', {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters,
    body: event.body ? '(body present)' : '(no body)'
  })

  try {
    // Ensure the webhook events table exists
    await ensureWebhookTableExists()
    
    // GET request for webhook verification
    if (event.httpMethod === 'GET') {
      const mode = event.queryStringParameters['hub.mode']
      const token = event.queryStringParameters['hub.verify_token']
      const challenge = event.queryStringParameters['hub.challenge']
      
      console.log('Verification attempt:', { mode, token, challenge: challenge ? '(present)' : '(missing)' })
      
      // Verify webhook - accept any token that starts with our prefix for flexibility
      // (since the token is generated dynamically in the browser)
      if (mode === 'subscribe' && 
          (token === WEBHOOK_VERIFY_TOKEN || token.startsWith('quest_instagram_webhook_'))) {
        console.log('Webhook verified successfully')
        return {
          statusCode: 200,
          body: challenge
        }
      } else {
        console.log('Webhook verification failed')
        return {
          statusCode: 403,
          body: 'Verification failed'
        }
      }
    }
    
    // POST request for webhook events
    if (event.httpMethod === 'POST') {
      let body
      try {
        body = JSON.parse(event.body)
        console.log('Received webhook event:', {
          object: body.object,
          entry: body.entry ? `(${body.entry.length} entries)` : '(no entries)'
        })
      } catch (e) {
        console.error('Failed to parse webhook body:', e)
        body = {}
      }
      
      // Store in Supabase
      const { data, error } = await supabase
        .from('instagram_webhook_events_x7y9z2')
        .insert({
          event_type: body.object || 'unknown',
          object: body.object || 'unknown',
          entry: body.entry || [],
          received_at: new Date().toISOString(),
        })
        .select()
      
      if (error) {
        console.error('Error storing webhook event:', error)
      } else {
        console.log('Webhook event stored successfully:', data)
      }
      
      return {
        statusCode: 200,
        body: 'EVENT_RECEIVED'
      }
    }
    
    return {
      statusCode: 405,
      body: 'Method not allowed'
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}