import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInstagram } from '../hooks/useInstagram';
import supabase from '../lib/supabase';

const { 
  FiUser, 
  FiCheck, 
  FiImage, 
  FiLoader, 
  FiEdit3, 
  FiAlertCircle, 
  FiGlobe,
  FiArrowRight
} = FiIcons;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, loading: instagramLoading, error: instagramError } = useInstagram();
  
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    subdomain: '',
    logo: null,
    logoPreview: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [subdomainAvailable, setSubdomainAvailable] = useState(true);
  const [subdomainChecking, setSubdomainChecking] = useState(false);

  // Sanitize username for subdomain
  const sanitizeSubdomain = (value) => {
    // Replace spaces, special characters, and convert to lowercase
    return value.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20); // Max 20 characters
  };

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain) => {
    if (!subdomain) return;
    
    try {
      setSubdomainChecking(true);
      
      // Check if subdomain exists in database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('subdomain', subdomain)
        .single();
        
      setSubdomainAvailable(!data);
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subdomain:', error);
      }
    } catch (err) {
      console.error('Failed to check subdomain:', err);
    } finally {
      setSubdomainChecking(false);
    }
  };

  // Pre-fill form with Instagram data when user loads
  useEffect(() => {
    if (user) {
      // Pre-fill form with Instagram data
      setFormData({
        name: user.name || user.username || '',
        about: user.biography || '',
        subdomain: sanitizeSubdomain(user.username || ''),
        logo: null,
        logoPreview: user.profile_picture_url || ''
      });
      
      // Check initial subdomain availability
      checkSubdomainAvailability(sanitizeSubdomain(user.username || ''));
    }
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subdomain') {
      const sanitized = sanitizeSubdomain(value);
      setFormData({ ...formData, [name]: sanitized });
      checkSubdomainAvailability(sanitized);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle logo file upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file must be less than 2MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setFormData({
      ...formData,
      logo: file,
      logoPreview: previewUrl
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Final check for subdomain availability
      if (!subdomainAvailable) {
        setError('Subdomain is not available. Please choose another one.');
        setLoading(false);
        return;
      }
      
      // 1. Upload logo to storage if provided
      let logoUrl = formData.logoPreview;
      
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile_images')
          .upload(filePath, formData.logo);
          
        if (uploadError) {
          throw new Error(`Error uploading logo: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data } = supabase.storage
          .from('profile_images')
          .getPublicUrl(filePath);
          
        logoUrl = data.publicUrl;
      }
      
      // 2. Create user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          instagram_id: user.instagram_id || user.id,
          name: formData.name,
          about: formData.about,
          subdomain: formData.subdomain,
          logo_url: logoUrl,
          instagram_username: user.username,
          created_at: new Date().toISOString()
        });
        
      if (profileError) {
        throw new Error(`Error creating profile: ${profileError.message}`);
      }
      
      // 3. Redirect to success page or dashboard
      navigate('/onboarding/success');
      
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (step === 1) {
      if (!formData.name) {
        setError('Please enter your name');
        return;
      }
    }
    
    setStep(step + 1);
    setError(null);
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  // Redirect to login if no Instagram user
  useEffect(() => {
    if (!instagramLoading && !user && !instagramError) {
      navigate('/');
    }
  }, [instagramLoading, user, instagramError, navigate]);

  // Show loading state while checking Instagram connection
  if (instagramLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Instagram Data...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your profile information
          </p>
        </div>
      </div>
    );
  }

  // Show error if Instagram connection failed
  if (instagramError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiAlertCircle} className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Instagram Connection Error
          </h2>
          <p className="text-red-600 mb-6">
            {instagramError || 'Failed to connect to Instagram'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main onboarding form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
              <SafeIcon icon={step === 1 ? FiUser : step === 2 ? FiEdit3 : FiGlobe} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Let's set up your account using your Instagram profile
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s === step
                      ? 'bg-purple-500 text-white'
                      : s < step
                      ? 'bg-green-100 text-green-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s < step ? <FiCheck /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Your name or business name"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be displayed on your profile
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {formData.logoPreview ? (
                        <img
                          src={formData.logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiImage} className="text-gray-400 text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                        <SafeIcon icon={FiImage} className="mr-2" />
                        <span>Upload New Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: About & Description */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                    About
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    rows="5"
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Tell us about yourself or your business"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    A short description that will appear on your profile
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Subdomain */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Your Subdomain
                  </label>
                  <div className="flex items-center">
                    <input
                      id="subdomain"
                      name="subdomain"
                      type="text"
                      value={formData.subdomain}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-3 rounded-l-lg border ${
                        subdomainAvailable ? 'border-gray-300' : 'border-red-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                      placeholder="yourname"
                    />
                    <div className="bg-gray-100 px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 text-gray-500">
                      .questera.app
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    {subdomainChecking ? (
                      <div className="flex items-center text-gray-500">
                        <SafeIcon icon={FiLoader} className="animate-spin mr-1" />
                        <span className="text-xs">Checking availability...</span>
                      </div>
                    ) : formData.subdomain ? (
                      subdomainAvailable ? (
                        <div className="flex items-center text-green-600">
                          <SafeIcon icon={FiCheck} className="mr-1" />
                          <span className="text-xs">Subdomain is available</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <SafeIcon icon={FiAlertCircle} className="mr-1" />
                          <span className="text-xs">Subdomain is not available</span>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Your subdomain will be your unique URL
                  </h3>
                  <p className="text-xs text-blue-700">
                    This will be the web address where people can find your profile.
                    Choose something simple and memorable!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                >
                  Continue
                  <SafeIcon icon={FiArrowRight} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !subdomainAvailable}
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <SafeIcon icon={FiCheck} className="ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;