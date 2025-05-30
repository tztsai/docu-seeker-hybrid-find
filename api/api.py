import logging
import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from bson.json_util import dumps, loads
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MongoDB Search API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
mongo_client = None
db_name = os.getenv("MONGODB_DB_NAME")
collection_name = os.getenv("MONGODB_COLLECTION")
_cache = {}

# Initialize MongoDB connection from environment variables
mongodb_uri = os.getenv("MONGODB_URI")
if mongodb_uri:
    try:
        logger.info("Attempting to connect to MongoDB using MONGODB_URI from environment...")
        mongo_client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
        # Test connection with ping
        mongo_client.admin.command('ping')
        server_info = mongo_client.admin.command('serverStatus')
        logger.info(f"Successfully connected to MongoDB {server_info.get('version')}")
        logger.info(f"Using database: {db_name}, collection: {collection_name}")
    except Exception as e:
        logger.error(f"Failed to connect using MONGODB_URI: {str(e)}")
        mongo_client = None

# Request models
class ConnectRequest(BaseModel):
    uri: str
    dbName: Optional[str] = None
    collectionName: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    isHybridSearch: Optional[bool] = False
    limit: Optional[int] = 300

# MongoDB connection endpoint
@app.post("/api/mongodb/connect")
async def connect_mongodb(request: ConnectRequest):
    global mongo_client, db_name, collection_name
    
    logger.info("[CONNECT] Attempting MongoDB connection...")
    
    try:
        # Close existing connection if any
        if mongo_client:
            mongo_client.close()
            logger.info("[CONNECT] Closed existing connection")

        # Create new client with server API version 1
        mongo_client = MongoClient(request.uri, server_api=ServerApi('1'))
        
        # Test connection with ping
        mongo_client.admin.command('ping')
        server_info = mongo_client.admin.command('serverStatus')
        
        # Update database and collection names if provided
        if request.dbName:
            db_name = request.dbName
        if request.collectionName:
            collection_name = request.collectionName

        logger.info(f"[CONNECT] Successfully connected to MongoDB {server_info.get('version')}")
        logger.info(f"[CONNECT] Using database: {db_name}, collection: {collection_name}")
        
        return {"success": True, "version": server_info.get('version')}
    
    except Exception as e:
        logger.error(f"[CONNECT] Connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# New endpoint to check connection status
@app.get("/api/mongodb/status")
async def check_connection_status():
    global mongo_client
    
    if not mongo_client:
        return {"connected": False}
    
    try:
        # Test connection with ping
        mongo_client.admin.command('ping')
        return {"connected": True}
    except Exception as e:
        logger.error(f"[STATUS] Connection check failed: {str(e)}")
        return {"connected": False}

# Search documents endpoint
@app.post("/api/mongodb/search")
async def search_documents(request: SearchRequest):
    logger.info("[SEARCH] Processing search request...")
    
    _cache.clear()  # Clear cache for each search request
    
    if not mongo_client:
        raise HTTPException(status_code=400, detail="Not connected to MongoDB")
    
    try:
        collection = mongo_client[db_name][collection_name]
        
        logger.info(f"[SEARCH] Collection info - Database: {db_name}, Collection: {collection_name}")
        logger.info(f"[SEARCH] Document count: {collection.count_documents({})}")
        
        if request.isHybridSearch:
            # Atlas Search indexes don't show up in collection.index_information()
            # They're managed by Atlas and need to be referenced by name
            logger.info("[SEARCH] Using Atlas Search for hybrid search")

            # Use the search index for the teachings collection
            search_index = os.environ.get("MONGODB_INDEX_NAME")
            logger.info(f"[SEARCH] Using search index: {search_index}")
            
            pipeline = [
                {
                    "$search": {
                        "index": search_index,
                        "compound": {
                            "should": [
                                {
                                    "text": {
                                        "query": request.query,
                                        "path": ["title", "content", "tags"],
                                        "score": { "boost": { "value": 3 } }
                                    }
                                }
                            ]
                        },
                        "highlight": { "path": ["title", "content"] }
                    }
                },
                { "$limit": request.limit },
                {
                    "$project": {
                        "_id": { "$toString": "$_id" },
                        "title": 1,
                        "content": 1,
                        "highlights": { "$meta": "searchHighlights" },
                        "Talk Type": 1,
                        "Text source": 1,
                        "Country": 1,
                        "City": 1,
                        "Date Code": 1,
                        "url": 1,
                    }
                }
            ]
            
            # Convert BSON/SON objects to Python dictionaries
            cursor = collection.aggregate(pipeline)
            results = list(map(format_document, json.loads(dumps(list(cursor)))))
            logger.info("[SEARCH] Successfully executed aggregation pipeline")
        else:
            cursor = collection.find({
                "$or": [
                    {"title": {"$regex": request.query, "$options": "i"}},
                    {"content": {"$regex": request.query, "$options": "i"}},
                    {"url": {"$regex": request.query, "$options": "i"}}
                ]
            }).limit(request.limit)

            results = [format_document(doc, request.query) for doc in cursor]

        _cache.update((doc["id"], doc) for doc in results)

        logger.info(f"[SEARCH] Found {len(results)} results")
        return {"results": results}
    
    except Exception as e:
        logger.error(f"[SEARCH] Search failed: {str(e)}")
        logger.error(f"[SEARCH] Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get document by ID endpoint
@app.get("/api/mongodb/documents/{id}")
async def get_document(id: str):
    logger.info(f"[GET] Fetching document: {id}")
    
    if not mongo_client:
        raise HTTPException(status_code=400, detail="Not connected to MongoDB")
    
    if id in _cache:
        return _cache[id]

    try:
        collection = mongo_client[db_name][collection_name]
        query = {"_id": ObjectId(id)} if len(id) == 24 else {"id": id}
        
        doc = collection.find_one(query)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        logger.info(f"[GET] Successfully retrieved document: {id}")
        return format_document(doc)
    
    except Exception as e:
        logger.error(f"[GET] Failed to retrieve document {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
def format_document(doc: Dict[str, Any], query: str = None) -> Dict[str, Any]:
    if 'highlights' in doc:
        for h in doc['highlights']:
            if h['path'] != 'title':
                h['content'] = ''.join(t['value'] for t in h['texts'])
    elif query:
        doc['highlights'] = [dict(score = 6, content = query)]

    # Extract source and location fields
    source = doc.get('Text source')
    country = doc.get('Country')
    city = doc.get('City')
    if country and city:
        location = f"{country} - {city}"
    elif country:
        location = country
    elif city:
        location = city
    else:
        location = None

    return {
        "id": str(doc["_id"]),
        "title": doc.get("title"),
        "url": doc.get("url"),
        "content": doc.get("content"),
        "category": doc.get("Talk Type"),
        "date": decode_date(doc.get("Date Code")),
        "source": source,
        "location": location,
        "highlights": doc.get("highlights", []),
    }

def decode_date(datecode: str) -> Optional[str]:
    if not isinstance(datecode, str) or not datecode.isdigit():
        return None
    y, m, d = [datecode[i:i+2] for i in range(0, len(datecode), 2)]
    try:
        return f"19{y}-{m}-{d}"
    except ValueError:
        logger.error(f"Invalid date format: {datecode}")
        return None

if __name__ == "__main__":
    import uvicorn
    logger.info(f"\n=== MongoDB Search API Server ===")
    logger.info(f"Default Database: {db_name}")
    logger.info(f"Default Collection: {collection_name}")
    logger.info(f"================================\n")
    uvicorn.run(app, host="0.0.0.0", port=3000)
