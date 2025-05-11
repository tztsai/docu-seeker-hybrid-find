import { Document } from '@/types/document';
import { API_ENDPOINTS } from '@/config/env';

/**
 * API Client
 * 
 * This service handles all API calls for MongoDB.
 */

// Connect to MongoDB
const connectToMongoDB = async (uri: string, dbName = 'search_demo', collectionName = 'documents'): Promise<any> => {
  const response = await fetch(API_ENDPOINTS.MONGODB_CONNECT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uri, dbName, collectionName }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to connect to MongoDB');
  }
  
  return data;
};

// Search documents using MongoDB hybrid search
const searchDocuments = async (
  query: string, 
  isHybridSearch: boolean = false, 
  limit: number = 20
): Promise<Document[]> => {
  const response = await fetch(API_ENDPOINTS.MONGODB_SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      query, 
      isHybridSearch, 
      limit 
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Search failed');
  }
  
  return data.results;
};

// Get document by ID
const getDocument = async (id: string): Promise<Document> => {
  const response = await fetch(API_ENDPOINTS.MONGODB_DOCUMENT(id));
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve document');
  }
  
  return data;
};

// Check if MongoDB is already connected
const checkConnectionStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.MONGODB_STATUS);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.connected === true;
  } catch (error) {
    console.log('MongoDB connection check failed:', error);
    return false;
  }
};

export const apiClient = {
  connectToMongoDB,
  searchDocuments,
  getDocument,
  checkConnection: checkConnectionStatus,
};
