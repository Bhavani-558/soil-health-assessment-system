import os
import joblib
import pandas as pd

from gradcam import generate_gradcam
from shap_explain import generate_shap_explanation
from soil_health_score import calculate_soil_health_score
from fertilizer_dosage import calculate_fertilizer_dosage
from crop_suitability import calculate_crop_suitability
from degradation_risk import calculate_degradation_risk
from degradation_trend import calculate_degradation_trend


# ============================================================
# 1. MODEL PATHS
# ============================================================

FERTILIZER_MODEL_PATH = (
    "models/fertilizer_xgboost.pkl"
)

DEFICIENCY_MODEL_PATH = (
    "models/nutrient_deficiency_xgboost.pkl"
)


# ============================================================
# 2. LOAD FERTILIZER MODEL
# ============================================================

print("Loading fertilizer XGBoost model...")

fertilizer_data = joblib.load(
    FERTILIZER_MODEL_PATH
)

fertilizer_model = fertilizer_data["model"]

fertilizer_encoder = (
    fertilizer_data["label_encoder"]
)

fertilizer_feature_columns = (
    fertilizer_data["feature_columns"]
)

print("Fertilizer model loaded!")


# ============================================================
# 3. LOAD NUTRIENT DEFICIENCY MODEL
# ============================================================

print("Loading nutrient-deficiency model...")

deficiency_data = joblib.load(
    DEFICIENCY_MODEL_PATH
)

deficiency_model = deficiency_data["model"]

deficiency_label_map = (
    deficiency_data["label_map"]
)

deficiency_features = (
    deficiency_data["features"]
)

print("Nutrient-deficiency model loaded!")


# ============================================================
# 4. NUTRIENT DEFICIENCY PREDICTION
# ============================================================

def predict_deficiency(soil_data):

    values = {

        "Nitrogen_Level":
            soil_data["Nitrogen"],

        "Phosphorus_Level":
            soil_data["Phosphorus"],

        "Potassium_Level":
            soil_data["Potassium"],

        "Soil_pH":
            soil_data["pH"],

        "Soil_Moisture":
            soil_data["Moisture"],

        "Organic_Carbon":
            soil_data["Organic_C"],

        "Electrical_Conductivity":
            soil_data["Electrical_Conductivity"],

        "Temperature":
            soil_data["Temperature"],

        "Humidity":
            soil_data["Humidity"],

        "Rainfall":
            soil_data["Rainfall"]
    }

    X = pd.DataFrame([values])

    X = X[deficiency_features]

    prediction = deficiency_model.predict(X)

    prediction_number = int(
        prediction[0]
    )

    reverse_map = {
        value: key
        for key, value in deficiency_label_map.items()
    }

    return reverse_map[
        prediction_number
    ]


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

    categorical_columns = X.select_dtypes(
        include=["object", "category"]
    ).columns

    X = pd.get_dummies(
        X,
        columns=categorical_columns,
        drop_first=True
    )

    X = X.reindex(
        columns=fertilizer_feature_columns,
        fill_value=0
    )

    prediction = fertilizer_model.predict(X)

    prediction_number = int(
        prediction[0]
    )

    fertilizer_result = (
        fertilizer_encoder.inverse_transform(
            [prediction_number]
        )[0]
    )

    return fertilizer_result



# ============================================================
# 6. FINAL PREDICTION FUNCTION
# ============================================================

def final_prediction(
    image_path,
    soil_data
):

    print()
    print("==========================================")
    print("      FINAL SOIL HEALTH ASSESSMENT")
    print("==========================================")


    # --------------------------------------------------------
    # A. CNN + GRAD-CAM
    # --------------------------------------------------------

    print("\nRunning CNN + Grad-CAM...")

    gradcam_result = generate_gradcam(
        image_path,
        "gradcam_result.jpg"
    )


    # --------------------------------------------------------
    # B. NUTRIENT DEFICIENCY
    # --------------------------------------------------------

    print(
        "Running nutrient-deficiency XGBoost..."
    )

    deficiency_result = predict_deficiency(
        soil_data
    )


    # --------------------------------------------------------
    # C. SHAP
    # --------------------------------------------------------

    print(
        "Generating SHAP explanation..."
    )

    shap_soil_data = {

        "Nitrogen_Level":
            soil_data["Nitrogen"],

        "Phosphorus_Level":
            soil_data["Phosphorus"],

        "Potassium_Level":
            soil_data["Potassium"],

        "Soil_pH":
            soil_data["pH"],

        "Soil_Moisture":
            soil_data["Moisture"],

        "Organic_Carbon":
            soil_data["Organic_C"],

        "Electrical_Conductivity":
            soil_data["Electrical_Conductivity"],

        "Temperature":
            soil_data["Temperature"],

        "Humidity":
            soil_data["Humidity"],

        "Rainfall":
            soil_data["Rainfall"]
    }

    shap_result = (
        generate_shap_explanation(
            shap_soil_data,
            "shap_feature_importance.png"
        )
    )


    # --------------------------------------------------------
    # D. FERTILIZER
    # --------------------------------------------------------

    print(
        "Running fertilizer XGBoost..."
    )

    fertilizer_result = predict_fertilizer(
        soil_data
    )
    print("Calculating fertilizer dosage...")

    fertilizer_dosage_result = calculate_fertilizer_dosage(
        deficiency_result,
        soil_data
    )
    # --------------------------------------------------------
    # E. SOIL HEALTH SCORE
    # --------------------------------------------------------

    print("Calculating soil health score...")

    soil_health_result = calculate_soil_health_score(
        soil_data
    )
    print("Calculating crop suitability...")

    crop_suitability_result = calculate_crop_suitability(
        soil_data
    )
    print("Calculating degradation risk...")

    degradation_risk_result = calculate_degradation_risk(
        soil_data
    )
    print("Calculating long-term degradation trend...")

    degradation_trend_result = calculate_degradation_trend()

    # --------------------------------------------------------
    # E. COMBINE EVERYTHING
    # --------------------------------------------------------

    final_result = {

        "soil_type":
            gradcam_result["soil_type"],

        "cnn_confidence":
            gradcam_result["confidence"],

        "gradcam_layer":
            gradcam_result["gradcam_layer"],

        "gradcam_image":
            gradcam_result["gradcam_image"],

        "soil_health_score":
            soil_health_result["soil_health_score"],

        "soil_health_category":
            soil_health_result["soil_health_category"],

        "nutrient_deficiency":
            deficiency_result,

        "shap_top_features":
            shap_result["feature_importance"],

        "shap_image":
            shap_result["shap_image"],

        "recommended_fertilizer":
            fertilizer_result,

        "fertilizer_dosage":
            fertilizer_dosage_result,

        "crop_suitability":
            crop_suitability_result,

        "degradation_risk":
            degradation_risk_result,

        "degradation_trend":
            degradation_trend_result,
        }


    return final_result


# ============================================================
# 7. TEST FINAL PIPELINE
# ============================================================

if __name__ == "__main__":

    # --------------------------------------------------------
    # TEST IMAGE
    # --------------------------------------------------------

    test_image = (
        "dataset/test/Black Soil/"
        "Black_1.jpg"
    )


    # --------------------------------------------------------
    # TEST SOIL DATA
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

        "Fertilizer_Used_Last": 100
    }


    # --------------------------------------------------------
    # RUN FINAL PIPELINE
    # --------------------------------------------------------

    result = final_prediction(
        test_image,
        test_soil_data
    )


    # --------------------------------------------------------
    # DISPLAY FINAL RESULT
    # --------------------------------------------------------

    print()
    print("==========================================")
    print("          FINAL PREDICTION")
    print("==========================================")

    print(
        "\nSoil Type:",
        result["soil_type"]
    )

    print(
        "CNN Confidence:",
        f'{result["cnn_confidence"]}%'
    )

    print(
        "Grad-CAM Layer:",
        result["gradcam_layer"]
    )

    print(
        "\nNutrient Deficiency:",
        result["nutrient_deficiency"]
    )

    print(
        "\nRecommended Fertilizer:",
        result["recommended_fertilizer"]
    )
    print(
        "Fertilizer Dosage:",
        result["fertilizer_dosage"]["dosage_kg_per_acre"],
        "kg/acre"
    )
    print(
        "\nSoil Health Score:",
        result["soil_health_score"],
    "/ 100"
    )
    print(
        "Soil Health Category:",
        result["soil_health_category"]
    )
    print("\nTop Suitable Crops:")

    

    for crop in result["crop_suitability"]:
        print(
            f"{crop['crop']} -> "
            f"{crop['suitability_score']} / 100"
    )

    print("\n======================================")
    print("Top Recommended Crop:")
    print(result["crop_suitability"][0]["crop"])
    print("======================================")

    print(
    "\nDegradation Risk Score:",
    result["degradation_risk"]["degradation_risk_score"],
    "/ 100"
    )

    print(
    "Degradation Risk Level:",
    result["degradation_risk"]["degradation_risk_level"]
    )

    print(
        "\nLong-Term Degradation Forecast:"
    )
    for year, value in zip(
        result["degradation_trend"]["forecast_years"],
        result["degradation_trend"]["forecast_values"]
    ):
        print(
            f"{year}: {value} / 100"
        )

    print(
        "Predicted 2030 Degradation:",
        result["degradation_trend"]["degradation_2030"],
        "/ 100"
    )

    print(
        "Long-Term Risk Level:",
       result["degradation_trend"]["risk_level"]
    )

    print(
        "\nTop SHAP Features:"
    )

    for item in result[
        "shap_top_features"
    ]:

        print(
            f'  {item["feature"]}: '
            f'{item["importance"]}'
        )

    print(
        "\nGrad-CAM Image:",
        result["gradcam_image"]
    )

    print(
        "SHAP Image:",
        result["shap_image"]
    )

    print(
        "\n=========================================="
    )
    print("       PIPELINE COMPLETED SUCCESSFULLY")
    print("==========================================")