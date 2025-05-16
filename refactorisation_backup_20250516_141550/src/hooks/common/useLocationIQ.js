import { useState } from 'react';
import axios from 'axios';

// API constants
const API_KEY = process.env.REACT_APP_LOCATIONIQ_API_KEY || '***REMOVED***';
const BASE_URL = 'https://eu1.locationiq.com/v1';

/**
 * Custom hook to interact with the LocationIQ API for geocoding
 * @returns {Object} Functions and state for LocationIQ API interaction
 */
export const useLocationIQ = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Search for addresses based on a query string
   * @param {string} query - The address to search for
   * @returns {Promise<Array>} Array of address results
   */
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      console.log('Query too short for LocationIQ API');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Searching for address: ${query}`);
      
      const response = await axios.get(`${BASE_URL}/search.php`, {
        params: {
          key: API_KEY,
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'fr'
        }
      });

      console.log(`Found ${response.data.length} results for: ${query}`);
      return response.data;
    } catch (err) {
      console.error('Error searching for address:', err);
      setError(err.message || 'Failed to search for address');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get detailed information about a location based on coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Location details
   */
  const reverseGeocode = async (lat, lon) => {
    if (!lat || !lon) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BASE_URL}/reverse.php`, {
        params: {
          key: API_KEY,
          lat,
          lon,
          format: 'json',
          addressdetails: 1
        }
      });

      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to reverse geocode');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    searchAddress,
    reverseGeocode
  };
};

export default useLocationIQ;