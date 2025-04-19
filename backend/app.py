from fastapi import FastAPI, Request, HTTPException, status
import uvicorn # Import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from bson import ObjectId # Import ObjectId from bson directly if needed

# --- Import Database Objects and Models ---
from database import (
    text_collection,
    TextDB,
    TextRequest,
    PyObjectId # Import PyObjectId from database.py
)
# -----------------------------------------

# Create a FastAPI instance
app = FastAPI(
    title="Text Analysis API",
    description="API for analyzing text data",
    version="1.0.0",
)

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get text from the request body to process it
@app.post("/analyze-text", response_model=TextDB, status_code=status.HTTP_201_CREATED)
async def analyze_text(request: TextRequest): # Changed function name for clarity
    # Extract the text from the request body
    text = request.text

    # --- TODO: Replace with actual text processing/classification ---
    # Example: Call your model or processing function here
    # classification_result = your_model.predict(text)
    processed_text = "Placeholder: suicidal" # Replace with actual result
    # ---------------------------------------------------------------
    
    return processed_text

# --- Endpoints to get/set list texts ---
@app.get("/texts", response_model=List[TextDB])
async def list_texts():
    texts = await text_collection.find().to_list(1000) # Example limit
    # Pydantic will validate each document against TextDB
    return texts

@app.get("/texts/{id}", response_model=TextDB)
async def get_text_by_id(id: str): # Changed function name
    try:
        # Use PyObjectId's validation logic implicitly via type hint
        # or explicitly if needed, but direct conversion is often fine here
        obj_id = ObjectId(id)
    except Exception: # Catch potential errors from invalid ObjectId strings
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid ID format: {id}")

    text = await text_collection.find_one({"_id": obj_id})
    if text:
        # Pydantic will validate the found document against TextDB
        return text
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Text with id {id} not found")

@app.post("/texts", response_model=TextDB, status_code=status.HTTP_201_CREATED)
async def import_text(text: TextRequest, classification: str):
    # Extract the text from the request body
    text_data = text.text
    
    # Insert into MongoDB
    try:
        new_text = await text_collection.insert_one(text_data, classification)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database insertion failed: {e}")
# -----------------------------------------------------------

# --- Uvicorn Hosting Block ---
if __name__ == "__main__":
    uvicorn.run(
        "app:app", # Points to the FastAPI instance 'app' in the file 'app.py'
        host="0.0.0.0", # Listen on all available network interfaces
        port=8000,      # Standard port for development
        reload=True,    # Enable auto-reload for development convenience
        log_level="info" # Set logging level
    )
# ---------------------------