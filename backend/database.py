from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId # Correct import for ObjectId
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic_core import core_schema
from typing import Optional, Any
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# --- MongoDB Connection ---
MONGO_URI = load_dotenv("MONGO_URI") # Load MongoDB URI from environment variable
client = AsyncIOMotorClient(MONGO_URI)
database = client.textanalysis
text_collection = database.get_collection("texts")
# --------------------------

# --- Pydantic Models (Schema Definition) ---
class PyObjectId(ObjectId):
    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        """Validate that the input is a valid ObjectId."""
        if isinstance(v, ObjectId):
            return v
        if ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        """
        Define how Pydantic should validate and serialize ObjectIds.
        """
        # Validator function to apply our custom logic
        # Use 'after' validation to ensure the input is first treated as a string if coming from JSON
        # or checked if it's already an ObjectId if coming from Python.
        validation_schema = core_schema.no_info_after_validator_function(
            cls.validate,
            # Base schema: Allow either a string (for JSON) or an ObjectId instance (for Python)
            schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.str_schema(),
                ]
            ),
        )

        return core_schema.union_schema(
             [
                 # Allow ObjectId instances directly
                 core_schema.is_instance_schema(ObjectId),
                 # Allow strings that pass our validation
                 validation_schema,
             ],
             # Define how to serialize to string
             serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
         )


    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema_obj: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> dict[str, Any]:
        """
        Return a JSON Schema representation for ObjectId (always a string).
        """
        # Regardless of the core schema, represent it as a string in JSON Schema.
        # The validation logic defined in core_schema still applies at runtime.
        return {
            "type": "string",
            "format": "objectid",
            "example": "6623a1b2c3d4e5f6a7b8c9d0"
        }

# Base model for text data
class TextBase(BaseModel):
    text: str

# Model representing a document in the 'texts' collection
class TextDB(TextBase):
    id: PyObjectId = Field(alias="_id")
    processed_text: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Model for the request body when analyzing text
class TextRequest(BaseModel):
    text: str
# -------------------------------------------