# This file is used to deploy the Python FastAPI app to Vercel
# It ensures that the PyMongo requirements are properly installed in the Vercel environment

from api.serverless import vc_handler

# Export the handler for Vercel serverless functions
__all__ = ["vc_handler"]
