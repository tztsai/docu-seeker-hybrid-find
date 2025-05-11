
// This service handles MongoDB connection status in the client
import { apiClient } from './apiClient';

/**
 * Check if MongoDB is connected by checking the API status endpoint
 */
const checkConnectionStatus = async (): Promise<boolean> => {
  return await apiClient.checkConnection();
};

/**
 * Placeholder for disconnect functionality
 * In the current implementation, connections are managed server-side
 */
const disconnect = (): void => {
  // Connection is managed server-side now
  console.log('Connection is managed server-side');
};

export const mongoDBService = {
  checkConnectionStatus,
  disconnect,
};
