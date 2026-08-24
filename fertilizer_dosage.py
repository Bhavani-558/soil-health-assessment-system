def calculate_fertilizer_dosage(
    nutrient_deficiency,
    soil_data
):

    dosage = 0
    fertilizer = "No fertilizer required"

    # Nitrogen deficiency
    if "Nitrogen deficiency" in nutrient_deficiency:
        fertilizer = "Urea"
        dosage = 50

    # Phosphorus deficiency
    elif "Phosphorus deficiency" in nutrient_deficiency:
        fertilizer = "DAP"
        dosage = 40

    # Potassium deficiency
    elif "Potassium deficiency" in nutrient_deficiency:
        fertilizer = "MOP"
        dosage = 30

    # Multiple deficiencies
    if (
        "Nitrogen deficiency" in nutrient_deficiency
        and "Phosphorus deficiency" in nutrient_deficiency
        and "Potassium deficiency" in nutrient_deficiency
    ):
        fertilizer = "Urea + DAP + MOP"
        dosage = 120

    return {
        "fertilizer": fertilizer,
        "dosage_kg_per_acre": dosage
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    test_deficiency = (
        "Nitrogen deficiency + "
        "Phosphorus deficiency + "
        "Potassium deficiency"
    )

    test_soil_data = {
        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,
        "pH": 6.5
    }

    result = calculate_fertilizer_dosage(
        test_deficiency,
        test_soil_data
    )

    print()
    print("======================================")
    print("FERTILIZER DOSAGE RECOMMENDATION")
    print("======================================")

    print(
        "Fertilizer:",
        result["fertilizer"]
    )

    print(
        "Recommended Dosage:",
        result["dosage_kg_per_acre"],
        "kg/acre"
    )

    print("======================================")