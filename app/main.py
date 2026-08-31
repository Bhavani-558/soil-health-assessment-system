from fastapi import FastAPI
import os

from fastapi import HTTPException
from pydantic import BaseModel
from sarvamai import SarvamAI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict

from app.database import Base, engine

from app.routers import (
    health,
    farms,
    fields,
    soil_records,
    images,
    fertilizer
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Soil Health Assessment API",
    version="1.0.0"
)
sarvam_client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.229.174.90:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Soil Health Assessment API"}


app.include_router(health.router)
app.include_router(farms.router)
app.include_router(fields.router)
app.include_router(soil_records.router)
app.include_router(images.router)
app.include_router(fertilizer.router)
app.include_router(predict.router)

# ============================================================
# SARVAM AI VOICE
# ============================================================

class VoiceRequest(BaseModel):
    text: str
    language: str = "hi-IN"


@app.post("/api/voice")
async def generate_voice(request: VoiceRequest):
    try:
        language_map = {
            "en": "en-IN",
            "hi": "hi-IN",
            "kn": "kn-IN",
            "en-IN": "en-IN",
            "hi-IN": "hi-IN",
            "kn-IN": "kn-IN",
        }

        language_code = language_map.get(
            request.language,
            "en-IN"
        )

        response = sarvam_client.text_to_speech.convert(
            text=request.text,
            model="bulbul:v3",
            language_code=language_code,
            speaker="shubh",
        )

        return {
            "success": True,
            "language": language_code,
            "audio": response.audios[0],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )