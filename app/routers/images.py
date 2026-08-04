from fastapi import APIRouter, UploadFile, File
import shutil
import os

router = APIRouter(
    prefix="/images",
    tags=["images"]
)

UPLOAD_FOLDER = "app/uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

images = {}


@router.post("/")
async def upload_image(file: UploadFile = File(...)):

    image_id = len(images) + 1

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    images[image_id] = file.filename

    return {
        "image_id": image_id,
        "filename": file.filename,
        "message": "Image uploaded successfully"
    }


@router.get("/{image_id}")
def get_image(image_id: int):

    if image_id not in images:
        return {"message": "Image not found"}

    return {
        "image_id": image_id,
        "filename": images[image_id]
    }