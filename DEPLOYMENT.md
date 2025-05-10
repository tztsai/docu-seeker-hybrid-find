# MongoDB Search Application Deployment Guide

This guide helps you deploy the MongoDB Search application in different environments. The application is a React-based frontend with an Express backend that connects to MongoDB Atlas for performing document searches.

## Prerequisites

- Node.js 18+ or Docker
- MongoDB Atlas account (free tier or above)
- MongoDB Atlas collection with documents

## Environment Setup

The application uses environment variables for configuration. There are example files in the repository:

- `.env.example` - Template with all available options
- `.env.development` - Development settings
- `.env.production` - Production settings 

### Essential Environment Variables

**Create a `.env` file for local development:**

```bash
# MongoDB Connection String (replace with your actual MongoDB URI)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# MongoDB Database Name
MONGODB_DB_NAME=search_demo

# MongoDB Collection Name
MONGODB_COLLECTION=documents

# Node Environment
NODE_ENV=development

# Port for server
PORT=3000
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account if you don't have one
2. Create a cluster (free tier works for testing)
3. Create a database and collection for your documents
4. Set up a search index for your collection

### Search Index Setup

You can use the built-in script to create a search index:

```bash
npm run setup:search
```

Alternatively, you can manually create an index via the MongoDB Atlas UI:

1. Go to your Atlas cluster
2. Click on "Search" in the left navigation
3. Click "Create Index"
4. Select your database and collection
5. Choose "JSON Editor" and use this configuration:

```json
{
  "name": "default",
  "definition": {
    "mappings": {
      "dynamic": true,
      "fields": {
        "title": {
          "type": "string",
          "analyzer": "lucene.standard",
          "multi": {
            "english": {
              "type": "string",
              "analyzer": "lucene.english"
            }
          }
        },
        "content": {
          "type": "string",
          "analyzer": "lucene.standard",
          "multi": {
            "english": {
              "type": "string",
              "analyzer": "lucene.english"
            }
          }
        },
        "tags": {
          "type": "string",
          "analyzer": "lucene.keyword"
        },
        "category": {
          "type": "string",
          "analyzer": "lucene.keyword"
        }
      }
    }
  }
}
```

## Local Deployment

### Development Mode

Run the frontend and backend separately:

```bash
# Install dependencies
npm install

# Run frontend
npm run dev

# Run backend in a separate terminal
npm run dev:server
```

Or run both simultaneously:

```bash
npm run dev:full
```

### Production Mode

Build and run the production server:

```bash
npm run build
npm start
```

## Docker Deployment

Build and run with Docker:

```bash
# Build the Docker image
docker build -t mongodb-search-app .

# Run the container
docker run -p 3000:3000 --env-file .env mongodb-search-app
```

Or use Docker Compose:

```bash
docker-compose up -d
```

## Cloud Deployment

### Heroku

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create mongodb-search-app

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set NODE_ENV=production

# Deploy the app
git push heroku main
```

### Vercel, Netlify, or other platforms

1. Configure your build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

2. Set the environment variables in the platform's dashboard

## Troubleshooting

### Connection Issues

- Verify your MongoDB URI is correct
- Ensure your IP address is allowed in MongoDB Atlas Network Access
- Check that your MongoDB user has the correct permissions

### Search Issues

- Make sure your Atlas Search index is properly configured
- Check that your documents have the expected structure
- For hybrid search issues, verify that vector embeddings are properly set up

## Advanced Configuration

For advanced MongoDB Atlas Search features:

1. Edit the search pipeline in `server/mongodb-api.cjs`
2. Add vector embeddings to your documents for semantic search

## Support

For issues and questions:

1. Check the [GitHub repository issues](https://github.com/yourusername/mongodb-search/issues)
2. Consult the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/)
