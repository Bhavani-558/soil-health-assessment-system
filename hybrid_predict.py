import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from tensorflow.keras.preprocessing import image


# ============================================================
# 1. MODEL PATHS
# ============================================================

CNN_MODEL_PATH = "models/soil_classifier.keras"
FERTILIZER_MODEL_PATH = "models/fertilizer_xgboost.pkl"
DEFICIENCY_MODEL_PATH = "models/nutrient_deficiency_xgboost.pkl"


# ============================================================
# 2. LOAD MODELS
# ============================================================

print("Loading models...")

cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)

fertilizer_data = joblib.load(FERTILIZER_MODEL_PATH)

fertilizer_model = fertilizer_data["model"]
fertilizer_encoder = fertilizer_data["label_encoder"]
fertilizer_feature_columns = fertilizer_data["feature_columns"]


deficiency_data = joblib.load(DEFICIENCY_MODEL_PATH)

deficiency_model = deficiency_data["model"]
deficiency_label_map = deficiency_data["label_map"]
deficiency_features = deficiency_data["features"]

print("All models loaded successfully!")


# ============================================================
# 3. CNN SOIL CLASSIFICATION
# ============================================================

CLASS_NAMES = [
    "Alluvial soil",
    "Black Soil",
    "Clay soil",
    "Red soil"
]


def predict_soil_image(image_path):

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    img = image.load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = image.img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    predictions = cnn_model.predict(
        img_array,
        verbose=0
    )

    predicted_index = int(
        np.argmax(predictions[0])
    )

    confidence = float(
        predictions[0][predicted_index]
    )

    return {
        "soil_type": CLASS_NAMES[predicted_index],
        "confidence": round(
            confidence * 100,
            2
        )
    }


# ============================================================
# 4. NUTRIENT DEFICIENCY PREDICTION
# ============================================================

def predict_deficiency(soil_data):

    values = {
        "Nitrogen_Level": soil_data["Nitrogen"],
        "Phosphorus_Level": soil_data["Phosphorus"],
        "Potassium_Level": soil_data["Potassium"],
        "Soil_pH": soil_data["pH"],
        "Soil_Moisture": soil_data["Moisture"],
        "Organic_Carbon": soil_data["Organic_C"],
        "Electrical_Conductivity":
            soil_data["Electrical_Conductivity"],
        "Temperature": soil_data["Temperature"],
        "Humidity": soil_data["Humidity"],
        "Rainfall": soil_data["Rainfall"]
    }

    X = pd.DataFrame([values])

    # Make sure columns are in exactly the same
    # order used during training
    X = X[deficiency_features]

    prediction = deficiency_model.predict(X)

    prediction_number = int(prediction[0])

    # Convert number back to original label
    reverse_map = {
        value: key
        for key, value in deficiency_label_map.items()
    }

    result = reverse_map[prediction_number]

    return result


# ============================================================
# 5. FERTILIZER RECOMMENDATION
# ============================================================

def predict_fertilizer(soil_data):

    data = {

        "Soil_Type":
            soil_data["Soil_Type"],

        "Soil_pH":
            soil_data["pH"],

        "Soil_Moist":
            soil_data["Moisture"],

        "Organic_C":
            soil_data["Organic_C"],

        "Electrical_":
            soil_data["Electrical_Conductivity"],

        "Nitrogen_L":
            soil_data["Nitrogen"],

        "Phosphoru":
            soil_data["Phosphorus"],

        "Potassium":
            soil_data["Potassium"],

        "Temperatu":
            soil_data["Temperature"],

        "Humidity":
            soil_data["Humidity"],

        "Rainfall":
            soil_data["Rainfall"],

        "Crop_Type":
            soil_data["Crop_Type"],

        "Crop_Grow":
            soil_data["Crop_Growth"],

        "Season":
            soil_data["Season"],

        "Irrigation_1":
            soil_data["Irrigation"],

        "Previous_C":
            soil_data["Previous_Crop"],

        "Region":
            soil_data["Region"],

        "Fertilizer_1":
            soil_data["Fertilizer_Used_Last"]
    }

    X = pd.DataFrame([data])

    # Convert categorical columns
    categorical_columns = X.select_dtypes(
        include=["object", "category"]
    ).columns

    X = pd.get_dummies(
        X,
        columns=categorical_columns,
        drop_first=True
    )

    # Match exactly the columns used during training
    X = X.reindex(
        columns=fertilizer_feature_columns,
        fill_value=0
    )

    prediction = fertilizer_model.predict(X)

    prediction_number = int(prediction[0])

    fertilizer_result = (
        fertilizer_encoder.inverse_transform(
            [prediction_number]
        )[0]
    )

    return fertilizer_result


# ============================================================
# 6. HYBRID PREDICTION
# ============================================================

def hybrid_prediction(image_path, soil_data):

    print("\n======================================")
    print("HYBRID SOIL HEALTH ASSESSMENT")
    print("======================================")

    # CNN prediction
    image_result = predict_soil_image(
        image_path
    )

    # Nutrient deficiency prediction
    deficiency_result = predict_deficiency(
        soil_data
    )

    # Fertilizer recommendation
    fertilizer_result = predict_fertilizer(
        soil_data
    )

    # Combine all results
    final_result = {

        "soil_type":
            image_result["soil_type"],

        "soil_type_confidence":
            image_result["confidence"],

        "nutrient_deficiency":
            deficiency_result,

        "recommended_fertilizer":
            fertilizer_result
    }

    return final_result


# ============================================================
# 7. TEST THE HYBRID PIPELINE
# ============================================================

if __name__ == "__main__":

    # --------------------------------------------------------
    # SOIL IMAGE
    # --------------------------------------------------------

    test_image = (
        "dataset/test/Black Soil/"
        "Black_1.jpg"
    )


    # --------------------------------------------------------
    # STRUCTURED SOIL DATA
    # --------------------------------------------------------

    test_soil_data = {

        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,

        "pH": 6.5,
        "Moisture": 30,
        "Organic_C": 0.8,
        "Electrical_Conductivity": 1.5,

        "Temperature": 25,
        "Humidity": 60,
        "Rainfall": 1000,

        "Soil_Type": "Clay",

        "Crop_Type": "Cotton",
        "Crop_Growth": "Vegetative",

        "Season": "Kharif",

        "Irrigation": "Rainfed",

        "Previous_Crop": "Wheat",

        "Region": "South",

        # Keep this numeric because your dataset
        # uses a numeric value for this field
        "Fertilizer_Used_Last": 100
    }


    # --------------------------------------------------------
    # RUN HYBRID PREDICTION
    # --------------------------------------------------------

    result = hybrid_prediction(
        test_image,
        test_soil_data
    )


    # --------------------------------------------------------
    # DISPLAY FINAL RESULT
    # --------------------------------------------------------

    print("\n======================================")
    print("FINAL HYBRID RESULT")
    print("======================================")

    print(
        "Soil Type:",
        result["soil_type"]
    )

    print(
        "CNN Confidence:",
        str(result["soil_type_confidence"]) + "%"
    )

    print(
        "Nutrient Deficiency:",
        result["nutrient_deficiency"]
    )

    print(
        "Recommended Fertilizer:",
        result["recommended_fertilizer"]
    )

    print("======================================")