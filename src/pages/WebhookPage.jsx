import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WebhookSetup from '../components/WebhookSetup';
import WebhookAPI from '../components/WebhookAPI';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiDatabase, FiRefreshCw, FiList, FiClock, FiTag } = FiIcons;

const WebhookPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Create the table if it doesn't exist
      await createWebhookTableIfNeeded();
      
      const { data, error } = await supabase
        .from('instagram_webhook_events_x7y9z2')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching webhook events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWebhookTableIfNeeded = async () => {
    try {
      // Check if table exists
      const { error } = await supabase
        .from('instagram_webhook_events_x7y9z2')
        .select('id')
        .limit(1);
        
      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        await supabase.rpc('create_webhook_events_table', {
          table_name: 'instagram_webhook_events_x7y9z2'
        });
      }
    } catch (err) {
      console.error('Error checking/creating webhook table:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Instagram Webhook Configuration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Set up webhooks to receive real-time updates from Instagram
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <WebhookSetup />
          </div>
          
          <div className="lg:col-span-2">
            <WebhookAPI />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <SafeIcon icon={FiDatabase} className="text-indigo-500 mr-2" />
                  Recent Webhook Events
                </h2>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchEvents}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  <SafeIcon icon={FiRefreshCw} className={loading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </motion.button>
              </div>
              
              {events.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <SafeIcon icon={FiList} className="text-gray-400 text-3xl mb-2 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-700">No Events Found</h3>
                  <p className="text-gray-500 mb-4">
                    Webhook events will appear here once received
                  </p>
                  <button
                    onClick={fetchEvents}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Check for Events
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Object
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Received At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <SafeIcon icon={FiTag} className="text-indigo-500 mr-2" />
                              <span className="text-sm text-gray-900">{event.event_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.object}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <SafeIcon icon={FiClock} className="text-gray-400 mr-2" />
                              {formatDate(event.received_at)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookPage;