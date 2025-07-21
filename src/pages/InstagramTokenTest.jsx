import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiUser, FiCamera, FiCheck, FiX, FiLoader, FiUsers, FiInfo } = FiIcons;

// The access token provided
const INSTAGRAM_ACCESS_TOKEN = 'IGAAUFdiBOrxFBZAFAtanRhR1MwMEtsdXFqNlJvWWxDMEN2NjNfZADVyVlVpRlpZAekxGQWFGS2MyRDhtanQ3d2FVOUFFUndIOWxHM0ZALLWpvX3o3M2pCaTNxR0lneTZABVTVzQ2NvYl95cFUxNlVyeW90ZA2RkQWRGVEtZAbDRxTDFTWQZDZD';
const INSTAGRAM_APP_ID = '1413379789860625';
const INSTAGRAM_APP_SECRET = 'e1be236ec20e1c5e154f094b09dbac84';

// Instagram Graph API base URL
const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

const InstagramTokenTest = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Check token validity
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${INSTAGRAM_GRAPH_URL}/v22.0/me?access_token=${token}`);
      const data = await response.json();
      return !data.error;
    } catch (error) {
      return false;
    }
  };

  // Get token debug info
  const getTokenInfo = async (token) => {
    try {
      const fields = ['expires_at', 'is_valid', 'scopes', 'type'];
      const params = new URLSearchParams({
        input_token: token,
        access_token: `${INSTAGRAM_APP_ID}|${INSTAGRAM_APP_SECRET}`,
      });
      
      const response = await fetch(`https://graph.facebook.com/debug_token?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  };

  // Get user profile information
  const getUserProfile = async (token) => {
    try {
      const fields = [
        'user_id',
        'username',
        'name',
        'account_type',
        'profile_picture_url',
        'followers_count',
        'follows_count',
        'media_count'
      ].join(',');

      const params = new URLSearchParams({
        fields,
        access_token: token
      });

      const response = await fetch(`${INSTAGRAM_GRAPH_URL}/v22.0/me?${params}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      return data.data ? data.data[0] : data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Get user media
  const getUserMedia = async (userId, token, limit = 10) => {
    try {
      const params = new URLSearchParams({
        access_token: token,
        limit: limit.toString()
      });

      const response = await fetch(`${INSTAGRAM_GRAPH_URL}/v22.0/${userId}/media?${params}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      // Get detailed media information
      if (data.data && data.data.length > 0) {
        const detailedMedia = await Promise.all(
          data.data.map(async (media) => {
            try {
              const mediaFields = [
                'id',
                'caption',
                'media_type',
                'media_url',
                'thumbnail_url',
                'permalink',
                'timestamp',
                'like_count',
                'comments_count'
              ].join(',');

              const mediaParams = new URLSearchParams({
                fields: mediaFields,
                access_token: token
              });

              const mediaResponse = await fetch(`${INSTAGRAM_GRAPH_URL}/v22.0/${media.id}?${mediaParams}`);
              return await mediaResponse.json();
            } catch (err) {
              console.warn('Error fetching media details:', err);
              return media;
            }
          })
        );
        
        return detailedMedia;
      }

      return [];
    } catch (error) {
      console.error('Error fetching user media:', error);
      return [];
    }
  };

  // Save user data to Supabase
  const saveUserToSupabase = async (profile, accessToken, tokenExpiresAt) => {
    try {
      const userData = {
        instagram_id: profile.id || profile.user_id,
        user_id: profile.user_id,
        username: profile.username,
        name: profile.name,
        account_type: profile.account_type,
        media_count: profile.media_count,
        followers_count: profile.followers_count,
        follows_count: profile.follows_count,
        profile_picture_url: profile.profile_picture_url,
        access_token: accessToken,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('instagram_users_x7y9z2')
        .upsert(userData, { 
          onConflict: 'instagram_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving user to Supabase:', error);
      return false;
    }
  };

  // Save posts to Supabase
  const savePostsToSupabase = async (userId, posts) => {
    try {
      if (!posts || posts.length === 0) return false;

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
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('instagram_posts_x7y9z2')
        .upsert(postsData, { 
          onConflict: 'instagram_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving posts to Supabase:', error);
      return false;
    }
  };

  // Load data using the provided token
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if token is valid
      const isValid = await validateToken(INSTAGRAM_ACCESS_TOKEN);
      if (!isValid) {
        throw new Error('The provided access token is invalid');
      }
      
      // Get token debug info
      const tokenDebugInfo = await getTokenInfo(INSTAGRAM_ACCESS_TOKEN);
      setTokenInfo(tokenDebugInfo);
      
      // Get user profile
      const profile = await getUserProfile(INSTAGRAM_ACCESS_TOKEN);
      setUserData(profile);
      
      // Get user media
      const userId = profile.user_id || profile.id;
      const media = await getUserMedia(userId, INSTAGRAM_ACCESS_TOKEN);
      setUserMedia(media);
      
      // Calculate token expiration (if not available from debug info)
      let tokenExpiresAt;
      if (tokenDebugInfo && tokenDebugInfo.data && tokenDebugInfo.data.expires_at) {
        tokenExpiresAt = new Date(tokenDebugInfo.data.expires_at * 1000).toISOString();
      } else {
        // Default to 60 days from now
        const date = new Date();
        date.setDate(date.getDate() + 60);
        tokenExpiresAt = date.toISOString();
      }
      
      // Save to Supabase
      await saveUserToSupabase(profile, INSTAGRAM_ACCESS_TOKEN, tokenExpiresAt);
      await savePostsToSupabase(userId, media);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load Instagram data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Instagram Token Test
          </h1>
          <p className="text-gray-600">
            Testing the provided Instagram access token
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading Instagram data...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 my-8"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiX} className="text-red-500 text-xl" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Token Error</h3>
                <p className="mt-2 text-red-700">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Token Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiInfo} className="text-blue-500 mr-2" />
                Token Information
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-x-auto">
                <pre className="text-xs text-gray-700">
                  {INSTAGRAM_ACCESS_TOKEN.substring(0, 20)}...{INSTAGRAM_ACCESS_TOKEN.substring(INSTAGRAM_ACCESS_TOKEN.length - 10)}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <SafeIcon 
                    icon={tokenInfo?.data?.is_valid ? FiCheck : FiX}
                    className={tokenInfo?.data?.is_valid ? "text-green-500 mr-2" : "text-red-500 mr-2"} 
                  />
                  <span className="text-gray-700">
                    Token Valid: <span className="font-medium">{tokenInfo?.data?.is_valid ? "Yes" : "No"}</span>
                  </span>
                </div>
                
                {tokenInfo?.data?.expires_at && (
                  <div className="flex items-center">
                    <SafeIcon icon={FiLoader} className="text-blue-500 mr-2" />
                    <span className="text-gray-700">
                      Expires: <span className="font-medium">{formatDate(new Date(tokenInfo.data.expires_at * 1000))}</span>
                    </span>
                  </div>
                )}
                
                {tokenInfo?.data?.type && (
                  <div className="text-gray-700">
                    Type: <span className="font-medium">{tokenInfo.data.type}</span>
                  </div>
                )}
                
                {tokenInfo?.data?.scopes && (
                  <div className="text-gray-700 md:col-span-2">
                    <p className="mb-1">Scopes:</p>
                    <div className="flex flex-wrap gap-2">
                      {tokenInfo.data.scopes.map((scope, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* User Profile */}
            {userData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <SafeIcon icon={FiUser} className="text-purple-500 mr-2" />
                  User Profile
                </h2>
                
                <div className="flex items-center space-x-4 mb-6">
                  {userData.profile_picture_url ? (
                    <img 
                      src={userData.profile_picture_url} 
                      alt={userData.username}
                      className="w-16 h-16 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 flex items-center justify-center rounded-full">
                      <SafeIcon icon={FiUser} className="text-purple-500 text-xl" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">@{userData.username}</h3>
                    {userData.name && <p className="text-gray-600">{userData.name}</p>}
                    <p className="text-sm text-gray-500 capitalize">{userData.account_type} Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <SafeIcon icon={FiCamera} className="text-gray-500 mb-1 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">{userData.media_count || 0}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <SafeIcon icon={FiUsers} className="text-gray-500 mb-1 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      {userData.followers_count ? userData.followers_count.toLocaleString() : 0}
                    </p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <SafeIcon icon={FiUsers} className="text-gray-500 mb-1 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      {userData.follows_count ? userData.follows_count.toLocaleString() : 0}
                    </p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Media Posts */}
            {userMedia && userMedia.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <SafeIcon icon={FiCamera} className="text-purple-500 mr-2" />
                  Recent Posts ({userMedia.length})
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userMedia.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="group relative bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-square relative">
                        {post.media_type === 'VIDEO' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <SafeIcon icon={FiIcons.FiVideo} className="text-gray-500 text-3xl" />
                          </div>
                        ) : (
                          <img 
                            src={post.media_url || post.thumbnail_url} 
                            alt={post.caption || 'Instagram post'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        )}
                        
                        <div 
                          className="w-full h-full hidden items-center justify-center bg-gray-200"
                        >
                          <SafeIcon icon={FiIcons.FiImage} className="text-gray-500 text-3xl" />
                        </div>
                        
                        {post.permalink && (
                          <a 
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            <SafeIcon icon={FiIcons.FiExternalLink} className="text-sm" />
                          </a>
                        )}
                      </div>
                      
                      <div className="p-2 text-xs text-gray-500">
                        {post.timestamp && formatDate(post.timestamp)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-8 text-center mb-6"
              >
                <SafeIcon icon={FiCamera} className="text-gray-400 text-3xl mb-2 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-700">No Posts Found</h3>
                <p className="text-gray-500">No media content was found for this account</p>
              </motion.div>
            )}
            
            {/* Supabase Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiIcons.FiDatabase} className="text-green-500 mr-2" />
                Storage Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
                  <span className="text-gray-700">Connected to Supabase</span>
                </div>
                
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
                  <span className="text-gray-700">
                    User data {userData ? 'saved' : 'not available'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-2" />
                  <span className="text-gray-700">
                    {userMedia.length} posts {userMedia.length > 0 ? 'saved' : 'not available'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors flex items-center"
              >
                <SafeIcon icon={FiIcons.FiRefreshCw} className="mr-2" />
                Refresh Data
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramTokenTest;