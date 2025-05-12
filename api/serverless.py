from mangum import Mangum
from api.api import app

# Create handler for AWS Lambda / Vercel
handler = Mangum(app)
