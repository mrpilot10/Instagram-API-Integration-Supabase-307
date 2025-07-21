import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInstagram } from '../hooks/useInstagram';

const { FiCheckCircle, FiExternalLink, FiArrowRight, FiHome } = FiIcons;

const OnboardingSuccessPage = () => {
  const { user } = useInstagram();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheckCircle} className="text-green-500 text-4xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Complete!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your profile has been successfully created and is ready to use.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Profile Details
          </h2>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Name:</span>
            <span className="font-medium text-gray-900">{user?.name || user?.username}</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Instagram:</span>
            <a 
              href={`https://instagram.com/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
            >
              @{user?.username}
              <SafeIcon icon={FiExternalLink} className="ml-1 text-xs" />
            </a>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your URL:</span>
            <a 
              href={`https://${user?.username.toLowerCase()}.questera.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
            >
              {user?.username.toLowerCase()}.questera.app
              <SafeIcon icon={FiExternalLink} className="ml-1 text-xs" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link
            to="/dashboard"
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center"
          >
            Go to Dashboard
            <SafeIcon icon={FiArrowRight} className="ml-2" />
          </Link>
          
          <Link
            to="/"
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <SafeIcon icon={FiHome} className="mr-2" />
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingSuccessPage;