// Browser-compatible webhook handler (no crypto module)
import supabase from '../lib/supabase'

// Generate a simple verification token without crypto
const generateSimpleToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'quest_instagram_webhook_'
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Webhook configuration
export const WEBHOOK_VERIFY_TOKEN = generateSimpleToken()
export const WEBHOOK_CALLBACK_URL = 'https://dainty-tulumba-0611fc.netlify.app/api/webhook'

// Store webhook events in Supabase
export const storeWebhookEvent = async (eventData) => {
  try {
    const { error } = await supabase
      .from('instagram_webhook_events_x7y9z2')
      .insert({
        event_type: eventData.type || 'unknown',
        object: eventData.object || 'unknown',
        entry: JSON.stringify(eventData.entry || []),
        received_at: new Date().toISOString(),
      })
    
    if (error) throw error
    return true
  } catch (err) {
    console.error('Error storing webhook event:', err)
    return false
  }
}

// Handle webhook verification request
export const handleWebhookVerification = (mode, token, challenge) => {
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    return {
      status: 200,
      body: challenge
    }
  } else {
    return {
      status: 403,
      body: 'Verification failed'
    }
  }
}

// Process webhook events
export const processWebhookEvent = async (eventData) => {
  try {
    // Store the event first
    await storeWebhookEvent(eventData)
    
    // Handle different event types
    if (eventData.object === 'instagram' && eventData.entry) {
      for (const entry of eventData.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            await handleInstagramChange(change, entry.id)
          }
        }
      }
    }
    
    return true
  } catch (err) {
    console.error('Error processing webhook event:', err)
    return false
  }
}

// Handle specific Instagram changes
const handleInstagramChange = async (change, userId) => {
  try {
    const { field, value } = change
    
    switch (field) {
      case 'media':
        // Handle media updates (new posts, etc.)
        if (value && value.media_id) {
          await handleMediaUpdate(value, userId)
        }
        break
        
      case 'comments':
        // Handle comment updates
        if (value && value.comment_id) {
          await handleCommentUpdate(value, userId)
        }
        break
        
      case 'mentions':
        // Handle mention updates
        if (value && value.media_id) {
          await handleMentionUpdate(value, userId)
        }
        break
        
      default:
        console.log('Unhandled field type:', field)
    }
  } catch (err) {
    console.error('Error handling Instagram change:', err)
  }
}

// Handle media updates (new posts, etc.)
const handleMediaUpdate = async (mediaData, userId) => {
  try {
    // Update or insert the media in our database
    const { error } = await supabase
      .from('instagram_posts_x7y9z2')
      .upsert({
        instagram_id: mediaData.media_id,
        user_instagram_id: userId,
        media_type: mediaData.media_type,
        permalink: mediaData.permalink,
        updated_at: new Date().toISOString(),
        webhook_updated: true
      }, {
        onConflict: 'instagram_id',
        ignoreDuplicates: false
      })
      
    if (error) throw error
  } catch (err) {
    console.error('Error updating media from webhook:', err)
  }
}

// Handle comment updates
const handleCommentUpdate = async (commentData, userId) => {
  // Implement comment handling logic
  console.log('Comment update received for user:', userId, commentData)
}

// Handle mention updates
const handleMentionUpdate = async (mentionData, userId) => {
  // Implement mention handling logic
  console.log('Mention update received for user:', userId, mentionData)
}