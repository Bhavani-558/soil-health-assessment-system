import joblib
import numpy as np
import pandas as pd
import shap
import matplotlib.pyplot as plt


# ============================================================
# 1. LOAD NUTRIENT DEFICIENCY MODEL
# ============================================================

MODEL_PATH = "models/nutrient_deficiency_xgboost.pkl"

print("Loading nutrient-deficiency XGBoost model...")

data = joblib.load(MODEL_PATH)

model = data["model"]
label_map = data["label_map"]
features = data["features"]

print("Nutrient-deficiency XGBoost model loaded!")


# ============================================================
# 2. CREATE SHAP EXPLAINER
# ============================================================

explainer = shap.TreeExplainer(model)


# ============================================================
# 3. SHAP EXPLANATION FUNCTION
# ============================================================

def generate_shap_explanation(
    soil_data,
    output_path="shap_feature_importance.png"
):

    # --------------------------------------------------------
    # Create input data
    # --------------------------------------------------------

    X = pd.DataFrame([
        soil_data
    ])

    X = X[features]


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(X)

    prediction_number = int(
        prediction[0]
    )


    # --------------------------------------------------------
    # Reverse label map
    # --------------------------------------------------------

    reverse_map = {
        value: key
        for key, value in label_map.items()
    }

    prediction_label = reverse_map[
        prediction_number
    ]


    # --------------------------------------------------------
    # SHAP values
    # --------------------------------------------------------

    shap_values = explainer.shap_values(X)

    shap_array = shap_values


    # --------------------------------------------------------
    # Handle SHAP output
    # --------------------------------------------------------

    if isinstance(shap_array, list):

        shap_array = np.stack(
            shap_array,
            axis=-1
        )


    if len(shap_array.shape) == 3:

        importance = np.abs(
            shap_array
        ).mean(
            axis=(0, 2)
        )

    elif len(shap_array.shape) == 2:

        importance = np.abs(
            shap_array
        ).mean(
            axis=0
        )

    else:

        raise ValueError(
            f"Unexpected SHAP shape: "
            f"{shap_array.shape}"
        )


    # --------------------------------------------------------
    # Create importance DataFrame
    # --------------------------------------------------------

    importance_df = pd.DataFrame({
        "Feature": features,
        "Importance": importance
    })


    importance_df = importance_df.sort_values(
        by="Importance",
        ascending=False
    )


    # --------------------------------------------------------
    # Save SHAP chart
    # --------------------------------------------------------

    plt.figure(
        figsize=(10, 6)
    )

    plt.barh(
        importance_df["Feature"],
        importance_df["Importance"]
    )

    plt.xlabel(
        "Mean Absolute SHAP Value"
    )

    plt.ylabel(
        "Soil Feature"
    )

    plt.title(
        "SHAP Feature Importance - Nutrient Deficiency"
    )

    plt.gca().invert_yaxis()

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


    # --------------------------------------------------------
    # Top important features
    # --------------------------------------------------------

    top_features = []

    for _, row in importance_df.head(5).iterrows():

        top_features.append({
            "feature": row["Feature"],
            "importance": round(
                float(row["Importance"]),
                4
            )
        })


    # --------------------------------------------------------
    # Return everything needed by final pipeline
    # --------------------------------------------------------

    return {
        "prediction": prediction_label,
        "feature_importance": top_features,
        "shap_image": output_path
    }


# ============================================================
# 4. TEST SHAP DIRECTLY
# ============================================================

if __name__ == "__main__":

    test_soil_data = {

        "Nitrogen_Level": 40,

        "Phosphorus_Level": 20,

        "Potassium_Level": 30,

        "Soil_pH": 6.5,

        "Soil_Moisture": 30,

        "Organic_Carbon": 0.8,

        "Electrical_Conductivity": 1.5,

        "Temperature": 25,

        "Humidity": 60,

        "Rainfall": 1000
    }


    result = generate_shap_explanation(
        test_soil_data,
        "shap_feature_importance.png"
    )


    print()
    print("======================================")
    print("SHAP RESULT")
    print("======================================")

    print(
        "Nutrient Deficiency:",
        result["prediction"]
    )

    print()
    print("Top SHAP Features:")

    for item in result["feature_importance"]:

        print(
            item["feature"],
            "->",
            item["importance"]
        )

    print()
    print(
        "SHAP image saved to:",
        result["shap_image"]
    )

    print("======================================")