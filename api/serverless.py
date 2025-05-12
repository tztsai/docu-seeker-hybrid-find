from mangum import Mangum
from api.api import app

# Create handler for AWS Lambda / Vercel
# Configure the Mangum handler with proper settings for Vercel
handler = Mangum(app, lifespan="off")
