# ============================================================
# LONG-TERM SOIL DEGRADATION TREND PREDICTOR
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.linear_model import Ridge


# ============================================================
# MAIN FUNCTION
# ============================================================

def calculate_degradation_trend():

    # ========================================================
    # 1. LOAD HISTORICAL DATA
    # ========================================================

    DATA_PATH = "historical_soil_data.csv"

    data = pd.read_csv(DATA_PATH)

    # ========================================================
    # 2. FEATURES AND TARGET
    # ========================================================

    features = [
        "Year",
        "Nitrogen",
        "Phosphorus",
        "Potassium",
        "Soil_pH",
        "Organic_Carbon",
        "Soil_Moisture"
    ]

    target = "Degradation_Index"

    X = data[features]

    y = data[target]

    # ========================================================
    # 3. TRAIN RIDGE REGRESSION MODEL
    # ========================================================

    model = Ridge(alpha=1.0)

    model.fit(X, y)

    # ========================================================
    # 4. PREDICT HISTORICAL VALUES
    # ========================================================

    data["Predicted_Degradation"] = model.predict(X)

    # ========================================================
    # 5. FUTURE PREDICTION
    # ========================================================

    future_years = np.array([
        2026,
        2027,
        2028,
        2029,
        2030
    ])

    # Use latest soil values as baseline
    latest = data.iloc[-1]

    future_data = pd.DataFrame({

        "Year": future_years,

        "Nitrogen": latest["Nitrogen"],

        "Phosphorus": latest["Phosphorus"],

        "Potassium": latest["Potassium"],

        "Soil_pH": latest["Soil_pH"],

        "Organic_Carbon": latest["Organic_Carbon"],

        "Soil_Moisture": latest["Soil_Moisture"]
    })

    future_predictions = model.predict(
        future_data[features]
    )

    # Keep values between 0 and 100
    future_predictions = np.clip(
        future_predictions,
        0,
        100
    )

    # ========================================================
    # 6. FINAL 2030 PREDICTION
    # ========================================================

    final_prediction = float(
        future_predictions[-1]
    )

    # ========================================================
    # 7. DEGRADATION LEVEL
    # ========================================================

    if final_prediction < 25:

        risk_level = "Very Low"

    elif final_prediction < 50:

        risk_level = "Low"

    elif final_prediction < 75:

        risk_level = "Moderate"

    else:

        risk_level = "High"

    # ========================================================
    # 8. CREATE TREND CHART
    # ========================================================

    plt.figure(
        figsize=(10, 6)
    )

    # Historical trend

    plt.plot(
        data["Year"],
        data["Degradation_Index"],
        marker="o",
        label="Historical"
    )

    # Future trend

    plt.plot(
        future_years,
        future_predictions,
        marker="o",
        linestyle="--",
        label="Predicted"
    )

    plt.xlabel("Year")

    plt.ylabel("Degradation Index")

    plt.title(
        "Long-Term Soil Degradation Trend"
    )

    plt.legend()

    plt.grid(True)

    plt.tight_layout()

    # ========================================================
    # 9. SAVE CHART
    # ========================================================

    OUTPUT_PATH = "soil_degradation_trend.png"

    plt.savefig(
        OUTPUT_PATH,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    # ========================================================
    # 10. RETURN RESULT
    # ========================================================

    return {

        "forecast_years":
            future_years.tolist(),

        "forecast_values":
            [
                round(float(x), 2)
                for x in future_predictions
            ],

        "degradation_2030":
            round(final_prediction, 2),

        "risk_level":
            risk_level,

        "trend_chart":
            OUTPUT_PATH
    }


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":

    result = calculate_degradation_trend()

    print()
    print("Historical soil data loaded successfully!")

    print()
    print("======================================")
    print("SOIL DEGRADATION FORECAST")
    print("======================================")

    for year, prediction in zip(
        result["forecast_years"],
        result["forecast_values"]
    ):

        print(
            f"{year}: "
            f"{prediction:.2f} / 100"
        )

    print()
    print("======================================")
    print("LONG-TERM DEGRADATION RISK")
    print("======================================")

    print(
        "Predicted 2030 Degradation:",
        f'{result["degradation_2030"]:.2f} / 100'
    )

    print(
        "Risk Level:",
        result["risk_level"]
    )

    print(
        "Trend chart saved to:",
        result["trend_chart"]
    )

    print("======================================")