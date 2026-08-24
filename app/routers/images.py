from fastapi import APIRouter, UploadFile, File
import shutil
import os
import numpy as np
import tensorflow as tf
from PIL import Image

router = APIRouter(
    prefix="/images",
    tags=["images"]
)

UPLOAD_FOLDER = "app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load trained CNN model
MODEL_PATH = "models/soil_classifier.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# IMPORTANT: Keep this order the same as the folders used during training
CLASS_NAMES = [
    "Alluvial soil",
    "Black Soil",
    "Clay soil",
    "Red soil"
]

images = {}


@router.post("/predict")
async def predict_soil(file: UploadFile = File(...)):

    # Save uploaded image
    image_id = len(images) + 1
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    images[image_id] = file.filename

    # Open image
    image = Image.open(file_path).convert("RGB")

    # Resize to the same size used during training
    image = image.resize((224, 224))

    # Convert image to array
    image_array = np.array(image) / 255.0

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # CNN prediction
    prediction = model.predict(image_array)

    predicted_index = np.argmax(prediction[0])
    confidence = float(np.max(prediction[0]) * 100)

    predicted_soil = CLASS_NAMES[predicted_index]

    return {
        "image_id": image_id,
        "filename": file.filename,
        "predicted_soil": predicted_soil,
        "confidence": round(confidence, 2),
        "message": "Soil image classified successfully"
    }


@router.get("/{image_id}")
def get_image(image_id: int):

    if image_id not in images:
        return {"message": "Image not found"}

    return {
        "image_id": image_id,
        "filename": images[image_id]
    }