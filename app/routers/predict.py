from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os

from final_prediction import final_prediction


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/predict",
    tags=["prediction"]
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = "app/uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ============================================================
# PREDICT ENDPOINT
# ============================================================

@router.post("/")
async def predict_soil(

    image: UploadFile = File(...),

    nitrogen: float = Form(...),
    phosphorus: float = Form(...),
    potassium: float = Form(...),

    ph: float = Form(...),
    moisture: float = Form(...),
    organic_c: float = Form(...),
    electrical_conductivity: float = Form(...),

    temperature: float = Form(...),
    humidity: float = Form(...),
    rainfall: float = Form(...),

    soil_type: str = Form(...),
    crop_type: str = Form(...),
    crop_growth: str = Form(...),
    season: str = Form(...),
    irrigation: str = Form(...),
    previous_crop: str = Form(...),
    region: str = Form(...),

    fertilizer_used_last: float = Form(...)
):

    try:

        # ----------------------------------------------------
        # 1. Save uploaded image
        # ----------------------------------------------------

        image_path = os.path.join(
            UPLOAD_DIR,
            image.filename
        )

        with open(
            image_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                image.file,
                buffer
            )


        # ----------------------------------------------------
        # 2. Create soil data
        # ----------------------------------------------------

        soil_data = {

            "Nitrogen": nitrogen,

            "Phosphorus": phosphorus,

            "Potassium": potassium,

            "pH": ph,

            "Moisture": moisture,

            "Organic_C": organic_c,

            "Electrical_Conductivity":
                electrical_conductivity,

            "Temperature": temperature,

            "Humidity": humidity,

            "Rainfall": rainfall,

            "Soil_Type": soil_type,

            "Crop_Type": crop_type,

            "Crop_Growth": crop_growth,

            "Season": season,

            "Irrigation": irrigation,

            "Previous_Crop": previous_crop,

            "Region": region,

            "Fertilizer_Used_Last":
                fertilizer_used_last
        }


        # ----------------------------------------------------
        # 3. Run complete ML pipeline
        # ----------------------------------------------------

        result = final_prediction(

            image_path,

            soil_data
        )


        # ----------------------------------------------------
        # 4. Return result
        # ----------------------------------------------------

        return {

            "status": "success",

            "prediction": result

        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )