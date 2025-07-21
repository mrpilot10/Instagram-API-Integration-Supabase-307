import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInstagram } from '../hooks/useInstagram';

const { FiLoader, FiCheckCircle, FiAlertCircle, FiArrowRight } = FiIcons;

const InstagramCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthCallback } = useInstagram();
  
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract code and state from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('🔄 Processing Instagram callback...');
        console.log('Code:', code ? code.substring(0, 10) + '...' : 'None');
        console.log('State:', state);
        console.log('Error:', error);

        // Check for OAuth errors
        if (error) {
          throw new Error(`Instagram OAuth error: ${error}`);
        }

        // Check for authorization code
        if (!code) {
          throw new Error('No authorization code received from Instagram');
        }

        // Exchange code for token and user data
        setStatus('processing');
        const result = await handleAuthCallback(code);

        if (result && result.success) {
          setStatus('success');
          setUserData(result.user);
          
          console.log('✅ Instagram authentication successful');
          
          // Redirect to onboarding after short delay
          setTimeout(() => {
            navigate('/onboarding');
          }, 2000);
        } else {
          throw new Error('Authentication failed - no success response');
        }

      } catch (err) {
        console.error('❌ Instagram callback error:', err);
        setStatus('error');
        setError(err.message || 'Authentication failed');
        
        // Redirect to home page after error delay
        setTimeout(() => {
          navigate('/');
        }, 5000);
      }
    };

    processCallback();
  }, [location.search, navigate, handleAuthCallback]);

  // Processing state
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connecting Instagram...
          </h2>
          <p className="text-gray-600">
            Please wait while we process your Instagram authentication
          </p>
          <div className="mt-4 text-sm text-gray-500">
            This may take a few moments
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiCheckCircle} className="text-green-500 text-3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Instagram Connected!
          </h2>
          {userData && (
            <p className="text-gray-600 mb-4">
              Welcome, @{userData.username}!
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Redirecting you to complete your profile setup...
          </p>
          <div className="flex items-center justify-center text-purple-600">
            <SafeIcon icon={FiArrowRight} className="mr-2" />
            <span className="text-sm">Setting up your account</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiAlertCircle} className="text-red-500 text-3xl" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connection Failed
        </h2>
        <p className="text-red-600 mb-6">
          {error || 'Failed to connect your Instagram account'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
          <p className="text-xs text-gray-500">
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InstagramCallback;