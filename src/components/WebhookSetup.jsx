import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { WEBHOOK_VERIFY_TOKEN, WEBHOOK_CALLBACK_URL } from '../services/webhookHandler';

const { FiGlobe, FiKey, FiClipboard, FiCheck, FiInfo } = FiIcons;

const WebhookSetup = () => {
  const [copied, setCopied] = useState({
    url: false,
    token: false
  });
  
  // Reset copy status after 2 seconds
  useEffect(() => {
    if (copied.url) {
      const timer = setTimeout(() => setCopied(prev => ({ ...prev, url: false })), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied.url]);
  
  useEffect(() => {
    if (copied.token) {
      const timer = setTimeout(() => setCopied(prev => ({ ...prev, token: false })), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied.token]);

  const handleCopy = (type, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(prev => ({ ...prev, [type]: true }));
    });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
          <SafeIcon icon={FiGlobe} className="text-indigo-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Instagram Webhook Setup
        </h2>
        <p className="text-gray-600">
          Configure your Instagram webhook to receive real-time updates
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <SafeIcon icon={FiInfo} className="text-blue-500 flex-shrink-0 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-800">Setup Instructions</h3>
            <p className="text-xs text-blue-700 mt-1">
              Use these values in the Facebook Developer Console to configure your Instagram webhook.
              Go to Products &gt; Webhooks &gt; Instagram &gt; Setup.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Callback URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Callback URL
          </label>
          <div className="flex">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg px-4 py-3 text-gray-700 text-sm font-mono overflow-x-auto">
              {WEBHOOK_CALLBACK_URL}
            </div>
            <button 
              onClick={() => handleCopy('url', WEBHOOK_CALLBACK_URL)}
              className="bg-gray-200 hover:bg-gray-300 rounded-r-lg px-3 flex items-center justify-center"
            >
              <SafeIcon 
                icon={copied.url ? FiCheck : FiClipboard} 
                className={copied.url ? "text-green-600" : "text-gray-600"} 
              />
            </button>
          </div>
        </div>
        
        {/* Verify Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verify Token
          </label>
          <div className="flex">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg px-4 py-3 text-gray-700 text-sm font-mono overflow-x-auto">
              {WEBHOOK_VERIFY_TOKEN}
            </div>
            <button 
              onClick={() => handleCopy('token', WEBHOOK_VERIFY_TOKEN)}
              className="bg-gray-200 hover:bg-gray-300 rounded-r-lg px-3 flex items-center justify-center"
            >
              <SafeIcon 
                icon={copied.token ? FiCheck : FiClipboard} 
                className={copied.token ? "text-green-600" : "text-gray-600"} 
              />
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Subscription Fields</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-indigo-50 px-3 py-2 rounded text-xs text-indigo-700">
              <SafeIcon icon={FiKey} className="inline-block mr-1" />
              mentions
            </div>
            <div className="bg-indigo-50 px-3 py-2 rounded text-xs text-indigo-700">
              <SafeIcon icon={FiKey} className="inline-block mr-1" />
              comments
            </div>
            <div className="bg-indigo-50 px-3 py-2 rounded text-xs text-indigo-700">
              <SafeIcon icon={FiKey} className="inline-block mr-1" />
              media
            </div>
            <div className="bg-indigo-50 px-3 py-2 rounded text-xs text-indigo-700">
              <SafeIcon icon={FiKey} className="inline-block mr-1" />
              stories
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WebhookSetup;