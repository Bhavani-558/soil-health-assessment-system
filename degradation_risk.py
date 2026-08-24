def calculate_degradation_risk(soil_data):

    risk = 0

    # ---------------------------------------------------------
    # 1. Nitrogen
    # ---------------------------------------------------------

    nitrogen = soil_data["Nitrogen"]

    if nitrogen < 20:
        risk += 20
    elif nitrogen < 30:
        risk += 15
    elif nitrogen < 40:
        risk += 10
    else:
        risk += 0


    # ---------------------------------------------------------
    # 2. Phosphorus
    # ---------------------------------------------------------

    phosphorus = soil_data["Phosphorus"]

    if phosphorus < 10:
        risk += 15
    elif phosphorus < 20:
        risk += 10
    else:
        risk += 0


    # ---------------------------------------------------------
    # 3. Potassium
    # ---------------------------------------------------------

    potassium = soil_data["Potassium"]

    if potassium < 20:
        risk += 15
    elif potassium < 30:
        risk += 10
    else:
        risk += 0


    # ---------------------------------------------------------
    # 4. Soil pH
    # ---------------------------------------------------------

    ph = soil_data["pH"]

    if ph < 5.0 or ph > 9.0:
        risk += 15
    elif ph < 5.5 or ph > 8.0:
        risk += 10
    elif ph < 6.0 or ph > 7.5:
        risk += 5


    # ---------------------------------------------------------
    # 5. Organic Carbon
    # ---------------------------------------------------------

    organic_carbon = soil_data["Organic_C"]

    if organic_carbon < 0.5:
        risk += 15
    elif organic_carbon < 0.75:
        risk += 10
    else:
        risk += 0


    # ---------------------------------------------------------
    # 6. Electrical Conductivity
    # ---------------------------------------------------------

    ec = soil_data["Electrical_Conductivity"]

    if ec > 4.0:
        risk += 10
    elif ec > 2.0:
        risk += 5


    # ---------------------------------------------------------
    # Convert to 0–100
    # ---------------------------------------------------------

    risk = min(risk, 100)


    # ---------------------------------------------------------
    # Risk Level
    # ---------------------------------------------------------

    if risk <= 20:
        level = "Very Low"

    elif risk <= 40:
        level = "Low"

    elif risk <= 60:
        level = "Moderate"

    elif risk <= 80:
        level = "High"

    else:
        level = "Very High"


    return {
        "degradation_risk_score": risk,
        "degradation_risk_level": level
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    test_soil_data = {

        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,

        "pH": 6.5,

        "Organic_C": 0.8,

        "Electrical_Conductivity": 1.5
    }


    result = calculate_degradation_risk(
        test_soil_data
    )


    print()
    print("======================================")
    print("DEGRADATION RISK")
    print("======================================")

    print(
        "Risk Score:",
        result["degradation_risk_score"],
        "/ 100"
    )

    print(
        "Risk Level:",
        result["degradation_risk_level"]
    )

    print("======================================")