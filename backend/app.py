from fastapi import FastAPI, Request, HTTPException, status, File, UploadFile
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId
from transformers import pipeline
import google.generativeai as genai # pip install google-generativeai
# --- Remove Google Cloud Speech ---
# from google.cloud import speech
# ----------------------------------
import os
from dotenv import load_dotenv
# --- Import Groq ---
from groq import Groq, GroqError # Import GroqError for specific handling
import json # Ensure json is imported
import traceback # Ensure traceback is imported
# -----------------

# --- Load Environment Variables ---
load_dotenv() # Load variables from .env file ONCE at the start

# --- Initialize Groq Client ---
try:
    groq_client = Groq(
        api_key=os.environ.get("GROQ_API"), # Reads GROQ_API from .env
    )
    if not os.environ.get("GROQ_API"):
        print("Warning: GROQ_API environment variable not set. Groq transcription will fail.")
        groq_client = None # Ensure client is None if key is missing
    else:
        print("Groq client initialized successfully.")
except Exception as e:
    print(f"FATAL: Error initializing Groq client: {e}")
    groq_client = None
# ----------------------------

# --- Configure Google AI ---
try:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=GOOGLE_API_KEY)
    print("Google Generative AI configured successfully.")
except Exception as e:
    print(f"FATAL: Error configuring Google Generative AI: {e}")
# -------------------------

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
    # --- Verify model name ---
    # Use "gemini-1.5-flash-latest" or another available/suitable model
    model_name = "gemini-1.5-flash-latest" # Changed back from 2.0
    # -------------------------

    try:
        model = genai.GenerativeModel(model_name=model_name)

        # --- Detailed Prompt for Structured JSON Output ---
        prompt = f"""
You are an AI assistant specialized in analyzing conversation transcripts for suicide risk assessment, designed to support trained crisis hotline professionals.
Analyze the following text transcript carefully. Based ONLY on the provided text, identify key indicators and generate a structured JSON output containing the following fields:

1.  `overall_risk_score`: An estimated numerical score from 0 to 100 representing the overall suicide risk level detected in the text.
2.  `risk_category`: A category based on the score ("Low", "Medium", "High", "Critical").
3.  `language_patterns`: A dictionary containing:
    *   `description`: A brief description of concerning language patterns detected (e.g., hopelessness, finality, burden).
    *   `intensity_score`: A numerical score from 0 to 100 indicating the intensity or prevalence of these patterns in the text.
4.  `risk_factors`: A dictionary containing:
    *   `list`: A list of identified risk factors (e.g., isolation, recent loss, sleep disturbance, specific plan).
    *   `prevalence_score`: A numerical score from 0 to 100 indicating the number and severity of risk factors mentioned.
5.  `protective_factors`: A dictionary containing:
    *   `list`: A list of identified protective factors (e.g., family connection, seeking help, future plans).
    *   `strength_score`: A numerical score from 0 to 100 indicating the presence and strength of protective factors mentioned.
6.  `emotional_state`: A dictionary containing:
    *   `description`: A brief description of the dominant emotional state detected (e.g., distress, worthlessness, anger, ambivalence).
    *   `intensity_score`: A numerical score from 0 to 100 indicating the intensity of the detected emotional state.
7.  `key_excerpts`: An array of 3 direct quotes from the text that are most indicative of the assessed risk or emotional state.
8.  `ai_insights`: A concise summary paragraph explaining the reasoning behind the assessment and highlighting the most critical indicators found in the text. Include a confidence level (e.g., "Confidence Level: 92%").
9.  `recommended_actions`: An array of 3 suggested actions based on the risk level (e.g., ["Immediate Intervention", "Safety Planning", "Emergency Services Referral", "Active Listening", "Follow-up Scheduling"]).

**Important:**
- Base your analysis strictly on the provided text. Do not infer information not present.
- Provide the output ONLY in valid JSON format. Do not include any introductory text or explanations outside the JSON structure.
- If the text is too short or lacks sufficient information for a category, indicate that (e.g., use "Not enough information in text" for descriptions, 0 or null for scores, and empty lists []).
- Ensure all numerical scores (`overall_risk_score`, `intensity_score`, `prevalence_score`, `strength_score`) are between 0 and 100.

**Transcript Text:**
**JSON Output:**
```json
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

# --- Groq Audio Transcription Endpoint ---
@app.post("/convert-audio-to-text")
async def convert_audio_to_text(audio_file: UploadFile = File(...)):
    """
    Receives an uploaded audio file (e.g., MP3), transcribes it using
    the Groq API (Whisper), analyzes the transcript using BOTH the local
    sentiment model and the Gemini detailed analysis, and returns all results.
    """
    if not groq_client:
         raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Groq transcription service is not available (client not initialized).")

    print(f"Received audio file for Groq: {audio_file.filename}, Content-Type: {audio_file.content_type}")

    transcript = "" # Initialize transcript variable
    sentiment_analysis_result = None # Result from local model
    gemini_analysis_result = None # Result from Gemini

    try:
        # Read the audio file content as bytes
        audio_content = await audio_file.read()
        print(f"Read {len(audio_content)} bytes from audio file.")

        # Prepare the file tuple for Groq API
        file_tuple = (audio_file.filename, audio_content)

        print("Sending audio to Groq API for transcription...")
        # Call Groq API
        transcription_response = groq_client.audio.transcriptions.create(
            file=file_tuple,
            model="whisper-large-v3", # Specify the Whisper model
        )
        print("Groq transcription response received.")

        # Extract transcript text
        transcript = transcription_response.text

        if not transcript:
            print("Groq returned no transcription results.")
            return {
                "transcription": "",
                "sentiment_analysis": None,
                "gemini_analysis": None,
                "message": "Transcription successful but no speech detected."
            }

        print(f"Transcript: {transcript}")

        # --- Create the request object needed by analysis functions ---
        analysis_request = TextRequest(text=transcript)
        # -----------------------------------------------------------

        sentiment_analysis_result_dict = None # Store the dict result here
        sentiment_context_str = None # Store the string version for Gemini

        # --- Call local sentiment analysis (analyze_text) ---
        try:
            print("Analyzing transcript for suicidality (local model)...")
            # analyze_text returns a list like [{'label': ..., 'score': ...}]
            sentiment_result_list = await analyze_text(request=analysis_request)

            # --- FIX: Access the dictionary inside the list ---
            if sentiment_result_list and isinstance(sentiment_result_list, list) and len(sentiment_result_list) > 0:
                # Get the first dictionary from the list
                sentiment_analysis_result_dict = sentiment_result_list[0]

                # Now perform checks and modifications on the dictionary
                if sentiment_analysis_result_dict.get("label") == "LABEL_0":
                    sentiment_analysis_result_dict["label"] = "Non-Suicidal"
                elif sentiment_analysis_result_dict.get("label") == "LABEL_1":
                    sentiment_analysis_result_dict["label"] = "Suicidal"

                print(f"Local sentiment analysis result: {sentiment_analysis_result_dict}")
                # Convert the final dict to a JSON string for Gemini context (if needed later)
                # sentiment_context_str = json.dumps(sentiment_analysis_result_dict)
            else:
                 print("Local sentiment analysis did not return expected format.")
                 sentiment_analysis_result_dict = {"error": "Invalid format from local model"}
                 # sentiment_context_str = json.dumps(sentiment_analysis_result_dict)
            # -------------------------------------------------

        except Exception as sentiment_e:
            print(f"Error during internal call to analyze_text (local model): {sentiment_e}")
            traceback.print_exc() # Print full traceback for sentiment errors
            sentiment_analysis_result_dict = {"error": f"Failed to get local sentiment analysis: {sentiment_e}"}
            # sentiment_context_str = json.dumps(sentiment_analysis_result_dict) # Also provide error context
        # ----------------------------------------------------

        # --- Call Gemini detailed analysis (gemini_analyze_text) ---
        # (Make sure this part correctly uses 'analysis_request' as shown previously)
        try:
            combined_message = sentiment_analysis_result_dict + analysis_request
            print("Analyzing transcript with Gemini...")
            gemini_analysis_result = await gemini_analyze_text(request=combined_message) # Pass the original request with text
            print("Gemini analysis result received.")
        except HTTPException as gemini_http_e:
             print(f"HTTP Error during internal call to gemini_analyze_text: Status={gemini_http_e.status_code}, Detail={gemini_http_e.detail}")
             gemini_analysis_result = {"error": f"Gemini analysis failed (HTTP {gemini_http_e.status_code}): {gemini_http_e.detail}"}
        except Exception as gemini_e:
            print(f"Error during internal call to gemini_analyze_text: {gemini_e}")
            traceback.print_exc()
            gemini_analysis_result = {"error": f"Failed to get Gemini analysis: {gemini_e}"}
        # ---------------------------------------------------------

        # Return transcript and both analysis results
        return gemini_analysis_result

    except GroqError as e:
        print(f"Groq API Error during audio transcription: {e}")
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        if hasattr(e, 'status_code') and e.status_code:
             status_code = e.status_code
        detail = f"Groq API error: {e.message if hasattr(e, 'message') else e}"
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        print(f"Error during audio processing: {e}")
        traceback.print_exc()
        # Include transcript if available but error happened later
        error_detail = f"Error processing audio file: {e}"
        # Return partial results if transcription was successful
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        ) # Or return partial results like {"transcription": transcript, "error": error_detail}
    finally:
        # Ensure the uploaded file handle is closed
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