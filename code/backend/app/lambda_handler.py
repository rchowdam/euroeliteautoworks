"""AWS Lambda entry point: Mangum turns Lambda events into normal requests for the app.

Lambda handler setting: app.lambda_handler.handler
"""

from mangum import Mangum

from .database import init_db
from .main import app

# Create tables once per cold start. Mangum's own lifespan support would repeat it on every request.
init_db()

handler = Mangum(app, lifespan="off")
