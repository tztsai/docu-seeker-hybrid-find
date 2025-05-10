from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from bson.json_util import dumps, loads
import json

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
db_name = "jkteachings"
collection_name = "teachings"

# Request models
class ConnectRequest(BaseModel):
    uri: str
    dbName: Optional[str] = None
    collectionName: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    isHybridSearch: Optional[bool] = False
    limit: Optional[int] = 20

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

# Search documents endpoint
@app.post("/api/mongodb/search")
async def search_documents(request: SearchRequest):
    logger.info("[SEARCH] Processing search request...")
    
    if not mongo_client:
        raise HTTPException(status_code=400, detail="Not connected to MongoDB")
    
    try:
        collection = mongo_client[db_name][collection_name]
        
        logger.info(f"[SEARCH] Collection info - Database: {db_name}, Collection: {collection_name}")
        logger.info(f"[SEARCH] Document count: {collection.count_documents({})}")
        
        if request.isHybridSearch:
            pipeline = [
                {
                    "$search": {
                        "index": "default",
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
                        "_id": 0,
                        "id": { "$toString": "$_id" },
                        "title": 1,
                        "content": 1,
                        "category": 1,
                        "date": 1,
                        "author": 1,
                        "tags": 1,
                        "highlights": { "$meta": "searchHighlights" }
                    }
                }
            ]
            
            # Convert BSON/SON objects to Python dictionaries
            cursor = collection.aggregate(pipeline)
            results = json.loads(dumps(list(cursor)))
            logger.info("[SEARCH] Successfully executed aggregation pipeline")
        else:
            cursor = collection.find({
                "$or": [
                    {"title": {"$regex": request.query, "$options": "i"}},
                    {"content": {"$regex": request.query, "$options": "i"}},
                    {"author": {"$regex": request.query, "$options": "i"}},
                    {"category": {"$regex": request.query, "$options": "i"}},
                    {"tags": {"$regex": request.query, "$options": "i"}}
                ]
            }).limit(request.limit)
            
            results = [{
                "id": str(doc["_id"]),
                "title": doc.get("title"),
                "content": doc.get("content"),
                "category": doc.get("category"),
                "date": doc.get("date"),
                "author": doc.get("author"),
                "tags": doc.get("tags", [])
            } for doc in cursor]

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
    
    try:
        collection = mongo_client[db_name][collection_name]
        query = {"_id": ObjectId(id)} if len(id) == 24 else {"id": id}
        
        doc = collection.find_one(query)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        formatted_doc = {
            "id": str(doc["_id"]),
            "title": doc.get("title"),
            "content": doc.get("content"),
            "category": doc.get("category"),
            "date": doc.get("date"),
            "author": doc.get("author"),
            "tags": doc.get("tags", [])
        }
        
        logger.info(f"[GET] Successfully retrieved document: {id}")
        return formatted_doc
    
    except Exception as e:
        logger.error(f"[GET] Failed to retrieve document {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info(f"\n=== MongoDB Search API Server ===")
    logger.info(f"Default Database: {db_name}")
    logger.info(f"Default Collection: {collection_name}")
    logger.info(f"================================\n")
    uvicorn.run(app, host="0.0.0.0", port=3000)
