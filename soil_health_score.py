def calculate_soil_health_score(soil_data):

    score = 0

    # ---------------------------------------------------------
    # 1. Nitrogen — 20 points
    # ---------------------------------------------------------

    nitrogen = soil_data["Nitrogen"]

    if 40 <= nitrogen <= 80:
        score += 20
    elif 30 <= nitrogen < 40 or 80 < nitrogen <= 100:
        score += 15
    elif 20 <= nitrogen < 30:
        score += 10
    else:
        score += 5


    # ---------------------------------------------------------
    # 2. Phosphorus — 15 points
    # ---------------------------------------------------------

    phosphorus = soil_data["Phosphorus"]

    if 20 <= phosphorus <= 50:
        score += 15
    elif 10 <= phosphorus < 20 or 50 < phosphorus <= 70:
        score += 10
    else:
        score += 5


    # ---------------------------------------------------------
    # 3. Potassium — 15 points
    # ---------------------------------------------------------

    potassium = soil_data["Potassium"]

    if 30 <= potassium <= 80:
        score += 15
    elif 20 <= potassium < 30 or 80 < potassium <= 100:
        score += 10
    else:
        score += 5


    # ---------------------------------------------------------
    # 4. Soil pH — 15 points
    # ---------------------------------------------------------

    ph = soil_data["pH"]

    if 6.0 <= ph <= 7.5:
        score += 15
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        score += 10
    else:
        score += 5


    # ---------------------------------------------------------
    # 5. Soil Moisture — 10 points
    # ---------------------------------------------------------

    moisture = soil_data["Moisture"]

    if 30 <= moisture <= 60:
        score += 10
    elif 20 <= moisture < 30 or 60 < moisture <= 70:
        score += 7
    else:
        score += 3


    # ---------------------------------------------------------
    # 6. Organic Carbon — 10 points
    # ---------------------------------------------------------

    organic_carbon = soil_data["Organic_C"]

    if 0.75 <= organic_carbon <= 1.5:
        score += 10
    elif 0.5 <= organic_carbon < 0.75:
        score += 7
    else:
        score += 4


    # ---------------------------------------------------------
    # 7. Electrical Conductivity — 5 points
    # ---------------------------------------------------------

    ec = soil_data["Electrical_Conductivity"]

    if 0.5 <= ec <= 2.0:
        score += 5
    elif 2.0 < ec <= 3.0:
        score += 3
    else:
        score += 1


    # ---------------------------------------------------------
    # 8. Convert score into health category
    # ---------------------------------------------------------

    if score >= 80:
        category = "Excellent"

    elif score >= 65:
        category = "Good"

    elif score >= 50:
        category = "Moderate"

    elif score >= 35:
        category = "Poor"

    else:
        category = "Critical"


    return {
        "soil_health_score": score,
        "soil_health_category": category
    }
if __name__ == "__main__":

    test_soil_data = {
        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,
        "pH": 6.5,
        "Moisture": 30,
        "Organic_C": 0.8,
        "Electrical_Conductivity": 1.5
    }

    result = calculate_soil_health_score(
        test_soil_data
    )

    print()
    print("======================================")
    print("SOIL HEALTH SCORE")
    print("======================================")

    print(
        "Score:",
        result["soil_health_score"],
        "/ 100"
    )

    print(
        "Category:",
        result["soil_health_category"]
    )

    print("======================================")