from mangum import Mangum
from api.api import app

# Create handler for AWS Lambda / Vercel
# Configure the Mangum handler with proper settings for Vercel
vc_handler = Mangum(app)
