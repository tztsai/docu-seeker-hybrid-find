
/**
 * THIS IS AN EXAMPLE FILE
 * 
 * In a real application, this would be implemented on your backend server.
 * For the purpose of this demo, we're showing what the backend code might look like.
 * 
 * You'll need to implement this in your actual backend environment (Node.js, etc.)
 */

// Import the MongoDB driver
const { MongoClient } = require('mongodb');

/**
 * Example backend route for connecting to MongoDB
 * 
 * POST /api/mongodb/connect
 * body: { uri: "mongodb://..." }
 */
async function handleMongoDBConnect(req, res) {
  try {
    const { uri } = req.body;
    
    if (!uri) {
      return res.status(400).json({ error: 'MongoDB URI is required' });
    }

    // Validate URI format
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      return res.status(400).json({ error: 'Invalid MongoDB URI format' });
    }

    // Create a new MongoClient
    const client = new MongoClient(uri, {
      // Connection options here
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    // Test the connection by connecting and getting the server info
    await client.connect();
    const serverInfo = await client.db().admin().serverInfo();
    
    // Close the connection after testing
    await client.close();

    // Return success with the version info (but not sensitive data)
    return res.status(200).json({ 
      success: true,
      version: serverInfo.version
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Handle different types of errors
    if (error.name === 'MongoServerSelectionError') {
      return res.status(400).json({ error: 'Could not connect to MongoDB server. Please check your URI and network.' });
    }
    
    if (error.name === 'MongoParseError') {
      return res.status(400).json({ error: 'Invalid MongoDB connection string. Please check your URI.' });
    }
    
    if (error.name === 'MongoError' && error.code === 18) {
      return res.status(401).json({ error: 'Authentication failed. Check username and password.' });
    }
    
    return res.status(500).json({ error: 'Failed to connect to MongoDB: ' + error.message });
  }
}

module.exports = {
  handleMongoDBConnect
};
