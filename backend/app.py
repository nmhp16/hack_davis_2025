from fastapi import FastAPI, Request, HTTPException, status, File, UploadFile # Added File, UploadFile
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId
from transformers import pipeline
import google.generativeai as genai
# --- Add Google Cloud Speech ---
from google.cloud import speech # pip install google-cloud-speech
# -----------------------------
import os
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv() # Load variables from .env file ONCE at the start

# --- Configure Google AI ---
try:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=GOOGLE_API_KEY)
    print("Google Generative AI configured successfully.")
except Exception as e:
    print(f"FATAL: Error configuring Google Generative AI: {e}")


# --- Import Database Objects and Models ---
from database import (
    text_collection,
    TextDB,
    TextRequest,
)
# -----------------------------------------

# --- Create FastAPI instance ---
app = FastAPI(
    title="Text Analysis API",
    description="API for analyzing text data",
    version="1.0.0",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---

@app.post("/analyze-text")
async def analyze_text(request: TextRequest):
    try:
        # Consider initializing pipeline outside function for efficiency
        classifier = pipeline("sentiment-analysis", model="sentinetyd/suicidality")
        text = request.text
        result = classifier(text)
        return result
    except Exception as e:
        print(f"Error during sentiment analysis: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error processing text with sentiment model.")


@app.post("/gemini-analyze-text")
async def gemini_analyze_text(request: TextRequest):
    model_name = "gemini-2.0-flash" # Corrected model name if needed, or use "gemini-1.0-pro" or "gemini-1.5-flash" etc.

    try:
        # Initialize model here if not done globally
        model = genai.GenerativeModel(model_name=model_name)

        # --- Use the text from the request ---
        # Corrected prompt concatenation
        prompt = """
            You are a helpful assistant. Please analyze the following text and provide insights or suggestions based on its content.
            The text is as follows:
        """ + request.text 

        # --- Configure generation parameters ---
        generation_config = genai.types.GenerationConfig(
            temperature=0.5,
            max_output_tokens=100
        )

        # --- Call the correct method with config ---
        response = await model.generate_content_async( # Use async version
            prompt,
            generation_config=generation_config
        )

        print("Response received from Gemini.")
        # Access the text safely
        if response.parts:
             return {"generated_text": response.text}
        else:
             # Log the reason for blockage/empty response
             feedback_reason = "Unknown"
             if response.prompt_feedback:
                 feedback_reason = response.prompt_feedback.block_reason.name if response.prompt_feedback.block_reason else "No specific reason provided"
             print(f"Gemini response blocked or empty. Reason: {feedback_reason}")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate content. Reason: {feedback_reason}")

    except Exception as e:
        print(f"Error calling Gemini model {model_name}: {e}")
        # Raise HTTPException instead of exit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error communicating with generative model: {e}")

# --- Corrected Audio Transcription Endpoint ---
@app.post("/convert-audio-to-text")
async def convert_audio_to_text(audio_file: UploadFile = File(...)):
    """
    Receives an uploaded audio file (e.g., MP3), transcribes it using
    Google Cloud Speech-to-Text, and returns the transcription.
    """
    # Optional: Check file type if needed
    if not audio_file.content_type.startswith("audio/"):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Please upload an audio file.")

    print(f"Received audio file: {audio_file.filename}, Content-Type: {audio_file.content_type}")

    try:
        # Read the audio file content as bytes
        audio_content = await audio_file.read()
        print(f"Read {len(audio_content)} bytes from audio file.")

        # Initialize Google Cloud Speech client
        client = speech.SpeechClient()

        # Prepare the audio object
        audio = speech.RecognitionAudio(content=audio_content)

        config = speech.RecognitionConfig(
            language_code="en-US",  # Adjust language code as needed
            enable_automatic_punctuation=True,
        )

        print("Sending audio to Google Cloud Speech-to-Text for recognition...")
        response = client.recognize(config=config, audio=audio)
        print("Transcription response received.")

        # Extract transcript
        transcript = ""
        if response.results:
            # Concatenate results if needed, but usually the first result is sufficient for short audio
            transcript = response.results[0].alternatives[0].transcript
            print(f"Transcript: {transcript}")
            return {"transcription": transcript}
        else:
            print("No transcription results returned by Google Cloud Speech.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transcription failed or audio contained no speech.")

    except Exception as e:
        print(f"Error during audio transcription: {e}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing audio file: {e}")
    finally:
        # Ensure the temporary file handle is closed
        await audio_file.close()
# -------------------------------------------------

# --- Database Endpoints ---
@app.get("/texts", response_model=List[TextDB])
async def list_texts():
    try:
        texts = await text_collection.find().to_list(1000)
        return texts
    except Exception as e:
        print(f"Error fetching texts: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving data from database.")


@app.get("/texts/{id}", response_model=TextDB)
async def get_text_by_id(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid ID format: {id}")

    try:
        text = await text_collection.find_one({"_id": obj_id})
        if text:
            return text
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Text with id {id} not found")
    except Exception as e:
        print(f"Error fetching text by ID {id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving data from database.")


# --- Corrected POST /texts endpoint ---
# Define a model that includes classification if needed
class TextCreateRequest(BaseModel): # Assuming BaseModel is imported or define it
    text: str
    classification: Optional[str] = None # Make classification optional or required

@app.post("/texts", response_model=TextDB, status_code=status.HTTP_201_CREATED)
async def create_text_entry(entry_data: TextCreateRequest): # Use the new model
    text_document = {
        "text": entry_data.text,
        "processed_text": entry_data.classification or "Needs processing" # Use provided classification or default
    }
    try:
        insert_result = await text_collection.insert_one(text_document) # Insert the dictionary
        created_doc = await text_collection.find_one({"_id": insert_result.inserted_id})
        if created_doc:
            return created_doc
        else:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve created document.")
    except Exception as e:
        print(f"Database insertion failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database insertion failed: {e}")
# -----------------------------------------------------------

# --- Uvicorn Hosting Block ---
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
# ---------------------------