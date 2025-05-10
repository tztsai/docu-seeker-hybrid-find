
import { mockApiService } from './mockApiService';

/**
 * API Client
 * 
 * This service abstracts the API calls for the application.
 * In development, it uses mock responses.
 * In production, replace with actual API calls.
 */

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || !import.meta.env.PROD;

// Connect to MongoDB
const connectToMongoDB = async (uri: string): Promise<any> => {
  if (isDevelopment) {
    // Use mock in development
    const response = await mockApiService.mockMongoDBConnect(uri);
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response;
  } else {
    // Use actual API in production
    const response = await fetch('/api/mongodb/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uri }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to connect to MongoDB');
    }
    
    return data;
  }
};

export const apiClient = {
  connectToMongoDB,
};
