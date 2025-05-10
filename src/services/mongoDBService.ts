
// This service handles MongoDB connection status in the client

/**
 * Check if the user has a MongoDB connection
 * This only checks local state, not actual connection status
 */
const isConnected = (): boolean => {
  return localStorage.getItem('mongodb_connected') === 'true';
};

/**
 * Clear MongoDB connection state
 */
const disconnect = (): void => {
  localStorage.removeItem('mongodb_connected');
};

export const mongoDBService = {
  isConnected,
  disconnect,
};
