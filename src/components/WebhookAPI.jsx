import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { WEBHOOK_VERIFY_TOKEN, WEBHOOK_CALLBACK_URL } from '../services/webhookHandler'

const { FiCode, FiCopy, FiCheck } = FiIcons

const WebhookAPI = () => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  // Supabase credentials
  const SUPABASE_URL = 'https://cshhunwykhbgbrnxdvkk.supabase.co'
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaGh1bnd5a2hiZ2JybnhkdmtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA3NDI4MiwiZXhwIjoyMDY4NjUwMjgyfQ.qnEXg4t6iiykjQ1wNsxgcALtwk9VsM85MlFMVutl6GY'
  
  const serverlessCode = `// netlify/functions/webhook.js
const { createClient } = require('@supabase/supabase-js')

// Constants
const WEBHOOK_VERIFY_TOKEN = '${WEBHOOK_VERIFY_TOKEN}'
const SUPABASE_URL = '${SUPABASE_URL}'
const SUPABASE_KEY = '${SUPABASE_SERVICE_KEY}' // Service role key already included

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

exports.handler = async function(event, context) {
  try {
    // GET request for webhook verification
    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.rawQuery)
      const mode = params.get('hub.mode')
      const token = params.get('hub.verify_token')
      const challenge = params.get('hub.challenge')
      
      // Verify webhook
      if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified')
        return {
          statusCode: 200,
          body: challenge
        }
      } else {
        return {
          statusCode: 403,
          body: 'Verification failed'
        }
      }
    }
    
    // POST request for webhook events
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body)
      
      // Store in Supabase
      const { error } = await supabase
        .from('instagram_webhook_events_x7y9z2')
        .insert({
          event_type: body.object || 'unknown',
          object: body.object || 'unknown',
          entry: JSON.stringify(body.entry || []),
          received_at: new Date().toISOString(),
        })
      
      if (error) {
        console.error('Error storing webhook event:', error)
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
}`

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-8"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <SafeIcon icon={FiCode} className="text-purple-500 mr-2" />
        Webhook API Implementation
      </h2>
      
      <p className="text-gray-600 mb-4">
        Use this serverless function code to handle Instagram webhook requests. The code is ready to deploy to Netlify with the Supabase service key already included.
      </p>
      
      <div className="relative">
        <pre className="bg-gray-900 text-gray-300 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{serverlessCode}</code>
        </pre>
        
        <button
          onClick={() => handleCopy(serverlessCode)}
          className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
        >
          <SafeIcon icon={copied ? FiCheck : FiCopy} className="text-sm" />
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Deployment Steps:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create a new file at <code>netlify/functions/webhook.js</code> with the code above</li>
          <li>Push the changes to your GitHub repository</li>
          <li>Netlify will automatically deploy the function</li>
          <li>Configure the webhook in Facebook Developer Console using:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Callback URL: <span className="font-mono">{WEBHOOK_CALLBACK_URL}</span></li>
              <li>Verify Token: <span className="font-mono">{WEBHOOK_VERIFY_TOKEN}</span></li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <SafeIcon icon={FiIcons.FiInfo} className="text-blue-500 flex-shrink-0 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-800">Important Security Notice</h3>
            <p className="text-xs text-blue-700 mt-1">
              The Supabase service key is now included in the code. In a production environment, this key should be stored as an environment variable in your Netlify deployment settings.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WebhookAPI