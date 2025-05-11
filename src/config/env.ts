/**
 * Environment Configuration
 * 
 * This file manages environment-specific configuration for the application
 */

// Base API URL based on environment
export const API_BASE_URL = import.meta.env.PROD 
  ? '' // Same domain in production (relative URL)
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';

// MongoDB API endpoints
export const API_ENDPOINTS = {
  MONGODB_CONNECT: `${API_BASE_URL}/api/mongodb/connect`,
  MONGODB_SEARCH: `${API_BASE_URL}/api/mongodb/search`,
  MONGODB_STATUS: `${API_BASE_URL}/api/mongodb/status`,
  MONGODB_DOCUMENT: (id: string) => `${API_BASE_URL}/api/mongodb/documents/${id}`,
};

// Environment feature flags
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
