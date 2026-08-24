from fastapi import APIRouter

router = APIRouter(
    prefix="/fertilizer",
    tags=["fertilizer"]
)


@router.post("/recommend")
def recommend_fertilizer(
    nitrogen: float,
    phosphorus: float,
    potassium: float
):
    deficiencies = []
    recommendations = []

    # Deficiency thresholds calculated from the dataset
    N_THRESHOLD = 54
    P_THRESHOLD = 29
    K_THRESHOLD = 37

    # Nitrogen deficiency
    if nitrogen < N_THRESHOLD:
        deficiencies.append("Nitrogen deficiency")
        recommendations.append("Urea")

    # Phosphorus deficiency
    if phosphorus < P_THRESHOLD:
        deficiencies.append("Phosphorus deficiency")
        recommendations.append("DAP")

    # Potassium deficiency
    if potassium < K_THRESHOLD:
        deficiencies.append("Potassium deficiency")
        recommendations.append("MOP")

    # No deficiency
    if not deficiencies:
        deficiencies.append("No major nutrient deficiency detected")
        recommendations.append("No fertilizer required")

    return {
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "deficiencies": deficiencies,
        "fertilizer_recommendation": recommendations
    }