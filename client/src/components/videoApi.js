import axios from 'axios';
import SummaryApi from '../common';

const API_BASE_URL = `${SummaryApi.defaultUrl}/api`;

export const api = {
  likeVideo: async (id, userId) => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}/like`,{
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({userId}),
    });
    console.log("response",response);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
  },

  dislikeVideo: async (id, userId) => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}/dislike`,{
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({userId}),
    });
    console.log("response",response);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
  },

  subscribeChannel: async (channelId) => {
    const response = await axios.put(
      `${API_BASE_URL}/users/sub/${channelId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  unsubscribeChannel: async (channelId) => {
    const response = await axios.put(
      `${API_BASE_URL}/users/unsub/${channelId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  incrementViews: async (id) => {
    const response = await axios.put(
      `${API_BASE_URL}/videos/${id}/view`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};