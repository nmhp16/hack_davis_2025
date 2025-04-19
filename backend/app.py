from fastapi import FastAPI, Request
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse

# Create a FastAPI instance
app = FastAPI(
    title="Text Analysis API",
    description="API for analyzing text data",
    version="1.0.0",
)


# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class TextRequest(BaseModel):
    text: str  # Define the expected structure of the request body
    
# Get text from the request body to process it
@app.post("/analyze-text")
async def get_text(request: TextRequest):
    # Extract the text from the request body
    text = request.text
    
    # Process the text 
    processed_text = "Test"
    
    return JSONResponse(content={"processed_text": processed_text}) 


# Run the server using uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    


    