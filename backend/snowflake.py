import os
from snowflake.snowpark import Session # pip install snowflake-snowpark-python
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file


connection_parameters = {
   "account": os.getenv("SNOWFLAKE_ACCOUNT"),
   "user": os.getenv("SNOWFLAKE_USER"),
   "password": os.getenv("SNOWFLAKE_PASSWORD"),
   # Add other auth methods like private_key_path if needed
   "role": os.getenv("SNOWFLAKE_ROLE"),
   "warehouse": os.getenv("SNOWFLAKE_WAREHOUSE"),
   "database": os.getenv("SNOWFLAKE_DATABASE"),
   "schema": os.getenv("SNOWFLAKE_SCHEMA")
}

# --- File and Stage Details ---
# !! IMPORTANT: Replace with the actual path to your model file !!
LOCAL_MODEL_FILE_PATH = r"C:\path\to\your\model\my_model.joblib" # Use raw string (r"...") for Windows paths

# The name of the stage you created in Snowflake (including the schema if not default)
# Ensure the role used has USAGE privilege on the schema and stage
TARGET_STAGE_NAME = "@MY_ML_DB.MY_ML_SCHEMA.model_stage" # Or just "@model_stage" if DB/Schema are set in session

# --- Main Upload Function ---
def upload_model_to_stage(local_path: str, stage_path: str, session: Session):
    """Uploads a local file to a Snowflake internal stage."""
    print(f"Attempting to upload '{local_path}' to stage '{stage_path}'...")
    try:
        # Use session.file.put to upload the file
        # auto_compress=False is often recommended for model files
        put_result = session.file.put(local_path, stage_path, auto_compress=False, overwrite=True)

        # Check the result
        if put_result:
            print(f"Successfully uploaded:")
            for result in put_result:
                print(f"  Source: {result.source_file}, Target: {result.target_file}, Status: {result.status}")
        else:
            print("Upload command executed, but no results returned (check stage content).")

    except Exception as e:
        print(f"Error uploading file: {e}")
        # Consider more specific error handling based on potential Snowflake errors

# --- Script Execution ---
if __name__ == "__main__":
    # Validate configuration
    missing_configs = [k for k, v in connection_parameters.items() if v is None and k != "password"] # Allow missing password if using other auth
    if missing_configs:
        print(f"Error: Missing Snowflake connection configuration for: {', '.join(missing_configs)}")
        print("Please set the corresponding environment variables.")
    elif not os.path.exists(LOCAL_MODEL_FILE_PATH):
         print(f"Error: Local model file not found at '{LOCAL_MODEL_FILE_PATH}'")
    else:
        session = None # Initialize session variable
        try:
            # Create a Snowpark session
            print("Connecting to Snowflake...")
            session = Session.builder.configs(connection_parameters).create()
            print(f"Connected! Current session context: DB='{session.get_current_database()}', Schema='{session.get_current_schema()}'")

            # Perform the upload
            upload_model_to_stage(LOCAL_MODEL_FILE_PATH, TARGET_STAGE_NAME, session)

        except Exception as e:
            print(f"An error occurred during session creation or upload: {e}")
        finally:
            # Close the session
            if session:
                print("Closing Snowflake session.")
                session.close()