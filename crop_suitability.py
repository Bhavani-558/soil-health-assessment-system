# ============================================================
# CROP SUITABILITY RANKING MODULE
# ============================================================

def calculate_parameter_score(value, ideal, tolerance):
    """
    Calculates how close a soil parameter is to
    the ideal value.

    Returns a score from 0 to 100.
    """

    difference = abs(value - ideal)

    score = 100 - (difference / tolerance) * 100

    # Keep score between 0 and 100
    score = max(0, min(100, score))

    return score


# ============================================================
# CROP IDEAL REQUIREMENTS
# ============================================================

CROP_REQUIREMENTS = {

    "Rice": {
        "pH": 6.2,
        "Nitrogen": 45,
        "Phosphorus": 20,
        "Potassium": 30
    },

    "Wheat": {
        "pH": 6.8,
        "Nitrogen": 55,
        "Phosphorus": 25,
        "Potassium": 35
    },

    "Maize": {
        "pH": 6.3,
        "Nitrogen": 60,
        "Phosphorus": 30,
        "Potassium": 35
    },

    "Groundnut": {
        "pH": 6.0,
        "Nitrogen": 30,
        "Phosphorus": 20,
        "Potassium": 30
    },

    "Cotton": {
        "pH": 6.8,
        "Nitrogen": 45,
        "Phosphorus": 25,
        "Potassium": 35
    }
}


# ============================================================
# TOLERANCE VALUES
# ============================================================

TOLERANCE = {

    "pH": 1.0,

    "Nitrogen": 30,

    "Phosphorus": 20,

    "Potassium": 25
}


# ============================================================
# MAIN FUNCTION
# ============================================================

def calculate_crop_suitability(soil_data):

    results = []

    # --------------------------------------------------------
    # Read soil values
    # --------------------------------------------------------

    nitrogen = soil_data["Nitrogen"]

    phosphorus = soil_data["Phosphorus"]

    potassium = soil_data["Potassium"]

    ph = soil_data["pH"]


    # --------------------------------------------------------
    # Calculate score for every crop
    # --------------------------------------------------------

    for crop, ideal in CROP_REQUIREMENTS.items():

        # Individual parameter scores

        ph_score = calculate_parameter_score(
            ph,
            ideal["pH"],
            TOLERANCE["pH"]
        )

        nitrogen_score = calculate_parameter_score(
            nitrogen,
            ideal["Nitrogen"],
            TOLERANCE["Nitrogen"]
        )

        phosphorus_score = calculate_parameter_score(
            phosphorus,
            ideal["Phosphorus"],
            TOLERANCE["Phosphorus"]
        )

        potassium_score = calculate_parameter_score(
            potassium,
            ideal["Potassium"],
            TOLERANCE["Potassium"]
        )


        # ----------------------------------------------------
        # Final weighted score
        # ----------------------------------------------------

        final_score = (

            ph_score * 0.25

            + nitrogen_score * 0.25

            + phosphorus_score * 0.25

            + potassium_score * 0.25
        )


        results.append({

            "crop": crop,

            "suitability_score": round(
                final_score,
                2
            )
        })


    # --------------------------------------------------------
    # Sort from highest to lowest
    # --------------------------------------------------------

    results.sort(

        key=lambda item:
        item["suitability_score"],

        reverse=True
    )


    return results


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    # Your current soil values

    test_soil_data = {

        "Nitrogen": 40,

        "Phosphorus": 20,

        "Potassium": 30,

        "pH": 6.5
    }


    # Run ranking

    results = calculate_crop_suitability(
        test_soil_data
    )


    # --------------------------------------------------------
    # Display results
    # --------------------------------------------------------

    print()

    print("======================================")

    print("CROP SUITABILITY RANKING")

    print("======================================")


    for rank, result in enumerate(
        results,
        start=1
    ):

        print(

            f"{rank}. "
            f"{result['crop']} -> "
            f"{result['suitability_score']} / 100"

        )


    print("======================================")

    print("Top Recommended Crop:")

    print(
        results[0]["crop"]
    )

    print("======================================")