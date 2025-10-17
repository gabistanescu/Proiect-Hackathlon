from fastapi import Request, Response
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def logging_middleware(request: Request, call_next):
    # Log the request details
    logging.info(f"Request: {request.method} {request.url}")
    
    # Process the request
    response: Response = await call_next(request)
    
    # Log the response details
    logging.info(f"Response: {response.status_code}")
    
    return response