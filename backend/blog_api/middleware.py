import time
import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Record the start time
        start_time = time.time()
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate the time taken
        duration = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Log the request details
        logger.info(f"{request.method} {request.path} - {duration:.2f}ms")
        
        return response