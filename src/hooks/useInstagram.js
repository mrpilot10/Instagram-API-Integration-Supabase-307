import { useState, useEffect } from 'react';
import * as instagramApi from '../services/instagramApi';

export const useInstagram = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for stored token info
      const tokenInfo = localStorage.getItem('instagram_token_info');
      if (!tokenInfo) {
        setLoading(false);
        return;
      }

      const { access_token } = JSON.parse(tokenInfo);
      
      // Validate token
      const isValid = await instagramApi.validateToken(access_token);
      if (!isValid) {
        localStorage.removeItem('instagram_token_info');
        setLoading(false);
        return;
      }

      // Get user profile and media
      const [profile, media] = await Promise.all([
        instagramApi.getUserProfile(access_token),
        instagramApi.getUserMedia(access_token)
      ]);

      setUser(profile);
      setPosts(media);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
      // Clear invalid token
      localStorage.removeItem('instagram_token_info');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthCallback = async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Processing auth callback with code:', code.substring(0, 10) + '...');
      
      const authData = await instagramApi.exchangeCodeForToken(code);
      
      if (!authData || !authData.success) {
        throw new Error(authData?.error || 'Authentication failed');
      }
      
      console.log('✅ Authentication successful:', authData.user.username);
      
      // Save token info to localStorage
      const tokenInfo = {
        access_token: authData.token.access_token,
        expires_at: authData.token.expires_at,
        user_id: authData.token.user_id
      };
      localStorage.setItem('instagram_token_info', JSON.stringify(tokenInfo));
      
      // Set state with user data and posts
      setUser(authData.user);
      setPosts(authData.posts || []);
      
      return authData;
    } catch (err) {
      console.error('❌ Auth callback error:', err);
      setError(err.message || 'Failed to authenticate with Instagram');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('instagram_token_info');
    setUser(null);
    setPosts([]);
    setError(null);
  };

  const refreshToken = async () => {
    try {
      const tokenInfo = localStorage.getItem('instagram_token_info');
      if (!tokenInfo) return false;

      const { access_token } = JSON.parse(tokenInfo);
      const refreshedData = await instagramApi.refreshAccessToken(access_token);
      
      // Update stored token
      const newTokenInfo = {
        access_token: refreshedData.access_token,
        expires_at: refreshedData.expires_at,
        user_id: JSON.parse(tokenInfo).user_id
      };
      localStorage.setItem('instagram_token_info', JSON.stringify(newTokenInfo));
      
      return true;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return false;
    }
  };

  return {
    user,
    posts,
    loading,
    error,
    handleAuthCallback,
    disconnect,
    refreshToken,
    loadUserData
  };
};