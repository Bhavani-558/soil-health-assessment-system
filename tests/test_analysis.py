import io
from unittest.mock import patch
from PIL import Image


def create_dummy_image_bytes():
    """Generate a valid 224x224 RGB image in JPEG format in-memory."""
    img = Image.new("RGB", (224, 224), color="brown")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()


def get_valid_soil_form_data():
    """Return a complete dictionary of valid soil prediction parameters."""
    return {
        "nitrogen": "45.0",
        "phosphorus": "25.0",
        "potassium": "35.0",
        "ph": "6.5",
        "moisture": "40.0",
        "organic_c": "0.85",
        "electrical_conductivity": "1.2",
        "temperature": "28.5",
        "humidity": "65.0",
        "rainfall": "120.0",
        "soil_type": "Black Soil",
        "crop_type": "Rice",
        "crop_growth": "Vegetative",
        "season": "Kharif",
        "irrigation": "Canal",
        "previous_crop": "Wheat",
        "region": "Andhra Pradesh",
        "fertilizer_used_last": "50.0",
    }


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Soil Health Assessment API"}


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Healthy"
    assert "API is running successfully" in data["message"]


def test_predict_valid_request(client):
    img_bytes = create_dummy_image_bytes()
    form_data = get_valid_soil_form_data()
    files = {"image": ("test_soil.jpg", img_bytes, "image/jpeg")}

    response = client.post("/predict/", data=form_data, files=files)
    assert response.status_code == 200
    json_resp = response.json()

    assert json_resp.get("status") == "success"
    assert "prediction" in json_resp

    pred = json_resp["prediction"]
    assert "soil_type" in pred
    assert "cnn_confidence" in pred
    assert "soil_health_score" in pred
    assert "soil_health_category" in pred
    assert "nutrient_deficiency" in pred
    assert "fertilizer_dosage" in pred
    assert "crop_suitability" in pred
    assert "gradcam_image_base64" in pred
    assert "gradcam_image_url" in pred


def test_predict_missing_image(client):
    form_data = get_valid_soil_form_data()
    response = client.post("/predict/", data=form_data)
    assert response.status_code == 422


def test_predict_missing_required_parameter(client):
    img_bytes = create_dummy_image_bytes()
    form_data = get_valid_soil_form_data()
    del form_data["nitrogen"]  # Remove required field

    files = {"image": ("test_soil.jpg", img_bytes, "image/jpeg")}
    response = client.post("/predict/", data=form_data, files=files)
    assert response.status_code == 422


def test_predict_invalid_numeric_parameter(client):
    img_bytes = create_dummy_image_bytes()
    form_data = get_valid_soil_form_data()
    form_data["nitrogen"] = "invalid_number_string"

    files = {"image": ("test_soil.jpg", img_bytes, "image/jpeg")}
    response = client.post("/predict/", data=form_data, files=files)
    assert response.status_code == 422


def test_gradcam_result_image_endpoint(client):
    response = client.get("/gradcam_result.jpg")
    # Should return either 200 OK (if generated) or 404 cleanly
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert response.headers["content-type"] == "image/jpeg"
