from soil_health_score import calculate_soil_health_score
from degradation_risk import calculate_degradation_risk
from degradation_trend import calculate_degradation_trend
from crop_suitability import calculate_crop_suitability, calculate_parameter_score
from fertilizer_dosage import calculate_fertilizer_dosage
from hybrid_predict import predict_deficiency, predict_fertilizer


def test_soil_health_score_excellent():
    sample_data = {
        "Nitrogen": 50,
        "Phosphorus": 30,
        "Potassium": 50,
        "pH": 6.8,
        "Moisture": 45,
        "Organic_C": 1.0,
        "Electrical_Conductivity": 1.2,
    }
    result = calculate_soil_health_score(sample_data)
    assert "soil_health_score" in result
    assert "soil_health_category" in result
    assert result["soil_health_score"] >= 80
    assert result["soil_health_category"] == "Excellent"


def test_soil_health_score_poor():
    sample_data = {
        "Nitrogen": 10,
        "Phosphorus": 5,
        "Potassium": 10,
        "pH": 4.5,
        "Moisture": 10,
        "Organic_C": 0.2,
        "Electrical_Conductivity": 4.5,
    }
    result = calculate_soil_health_score(sample_data)
    assert result["soil_health_score"] < 50
    assert result["soil_health_category"] in ["Poor", "Critical"]


def test_degradation_risk_low():
    sample_data = {
        "Nitrogen": 50,
        "Phosphorus": 30,
        "Potassium": 40,
        "pH": 6.8,
        "Organic_C": 1.2,
        "Electrical_Conductivity": 1.0,
    }
    result = calculate_degradation_risk(sample_data)
    assert "degradation_risk_score" in result
    assert "degradation_risk_level" in result
    assert result["degradation_risk_score"] <= 20
    assert result["degradation_risk_level"] == "Very Low"


def test_degradation_risk_high():
    sample_data = {
        "Nitrogen": 10,
        "Phosphorus": 5,
        "Potassium": 10,
        "pH": 4.5,
        "Organic_C": 0.2,
        "Electrical_Conductivity": 5.0,
    }
    result = calculate_degradation_risk(sample_data)
    assert result["degradation_risk_score"] > 60
    assert result["degradation_risk_level"] in ["High", "Very High"]


def test_degradation_trend_forecast():
    result = calculate_degradation_trend()
    assert "forecast_years" in result
    assert "forecast_values" in result
    assert len(result["forecast_years"]) == 5
    assert len(result["forecast_values"]) == 5


def test_calculate_parameter_score():
    score_perfect = calculate_parameter_score(6.2, 6.2, 1.0)
    assert score_perfect == 100.0

    score_partial = calculate_parameter_score(6.7, 6.2, 1.0)
    assert 0.0 < score_partial < 100.0

    score_out_of_bounds = calculate_parameter_score(10.0, 6.2, 1.0)
    assert score_out_of_bounds == 0.0


def test_crop_suitability_ranking():
    sample_data = {
        "Nitrogen": 45,
        "Phosphorus": 20,
        "Potassium": 30,
        "pH": 6.2,
    }
    results = calculate_crop_suitability(sample_data)
    assert isinstance(results, list)
    assert len(results) > 0
    # Top ranked crop should have highest suitability score
    assert "crop" in results[0]
    assert "suitability_score" in results[0]
    assert results[0]["suitability_score"] >= results[-1]["suitability_score"]


def test_fertilizer_dosage_single_deficiency():
    deficiency = "Nitrogen deficiency"
    soil_data = {"Nitrogen": 30, "Phosphorus": 40, "Potassium": 50, "pH": 6.5}
    result = calculate_fertilizer_dosage(deficiency, soil_data)
    assert result["fertilizer"] == "Urea"
    assert result["dosage_kg_per_acre"] == 50


def test_fertilizer_dosage_multiple_deficiencies():
    deficiency = "Nitrogen deficiency + Phosphorus deficiency + Potassium deficiency"
    soil_data = {"Nitrogen": 10, "Phosphorus": 10, "Potassium": 10, "pH": 6.5}
    result = calculate_fertilizer_dosage(deficiency, soil_data)
    assert result["fertilizer"] == "Urea + DAP + MOP"
    assert result["dosage_kg_per_acre"] == 120


def test_fertilizer_dosage_no_deficiency():
    deficiency = "No deficiency detected"
    soil_data = {"Nitrogen": 60, "Phosphorus": 40, "Potassium": 50, "pH": 6.5}
    result = calculate_fertilizer_dosage(deficiency, soil_data)
    assert result["fertilizer"] == "No fertilizer required"
    assert result["dosage_kg_per_acre"] == 0


def test_hybrid_predict_deficiency():
    sample_soil_data = {
        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,
        "pH": 6.5,
        "Moisture": 40,
        "Organic_C": 0.8,
        "Electrical_Conductivity": 1.2,
        "Temperature": 28,
        "Humidity": 65,
        "Rainfall": 120,
        "Soil_Type": "Black Soil",
        "Crop_Type": "Rice",
        "Crop_Growth": "Vegetative",
        "Season": "Kharif",
        "Irrigation": "Canal",
        "Previous_Crop": "Wheat",
        "Region": "Andhra Pradesh",
        "Fertilizer_Used_Last": 50,
    }
    result = predict_deficiency(sample_soil_data)
    assert isinstance(result, str)
    assert len(result) > 0


def test_hybrid_predict_fertilizer():
    sample_soil_data = {
        "Nitrogen": 40,
        "Phosphorus": 20,
        "Potassium": 30,
        "pH": 6.5,
        "Moisture": 40,
        "Organic_C": 0.8,
        "Electrical_Conductivity": 1.2,
        "Temperature": 28,
        "Humidity": 65,
        "Rainfall": 120,
        "Soil_Type": "Black Soil",
        "Crop_Type": "Rice",
        "Crop_Growth": "Vegetative",
        "Season": "Kharif",
        "Irrigation": "Canal",
        "Previous_Crop": "Wheat",
        "Region": "Andhra Pradesh",
        "Fertilizer_Used_Last": 50,
    }
    result = predict_fertilizer(sample_soil_data)
    assert isinstance(result, str)
    assert len(result) > 0
