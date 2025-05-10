
/**
 * Mock API Service
 * 
 * This service simulates API calls for development and testing.
 * In a production app, replace with actual API calls.
 */

// Mock MongoDB connection response
const mockMongoDBConnect = async (uri: string): Promise<{ success: boolean; error?: string; version?: string }> => {
  console.log('Simulating MongoDB connection to:', uri);
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate successful connection most of the time
      if (uri.includes('invalid') || Math.random() > 0.8) {
        resolve({
          success: false,
          error: 'Could not connect to MongoDB server. Please check your URI and network.'
        });
      } else {
        resolve({
          success: true,
          version: '7.0.0' // Mock MongoDB version
        });
      }
    }, 1500);
  });
};

export const mockApiService = {
  mockMongoDBConnect
};
