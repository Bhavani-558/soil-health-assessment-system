import io
from PIL import Image


def create_dummy_image_bytes():
    img = Image.new("RGB", (224, 224), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()


# -------------------------------------------------------------------
# FARMS STORAGE & CRUD TESTS
# -------------------------------------------------------------------

def test_create_farm_storage(client):
    payload = {
        "farmer_name": "Ramesh Kumar",
        "village": "Ananthapur",
        "district": "Guntur"
    }
    response = client.post("/farms/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["farmer_name"] == "Ramesh Kumar"
    assert data["village"] == "Ananthapur"
    assert data["district"] == "Guntur"
    assert "id" in data


def test_create_farm_missing_fields(client):
    payload = {
        "farmer_name": "Ramesh Kumar"
        # missing village and district
    }
    response = client.post("/farms/", json=payload)
    assert response.status_code == 422


def test_get_farms_storage(client):
    client.post("/farms/", json={"farmer_name": "Farmer 1", "village": "V1", "district": "D1"})
    client.post("/farms/", json={"farmer_name": "Farmer 2", "village": "V2", "district": "D2"})

    response = client.get("/farms/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


# -------------------------------------------------------------------
# FIELDS STORAGE & CRUD TESTS
# -------------------------------------------------------------------

def test_create_field_storage(client):
    farm_resp = client.post("/farms/", json={"farmer_name": "Suresh", "village": "V3", "district": "D3"}).json()
    farm_id = farm_resp["id"]

    field_payload = {
        "farm_id": farm_id,
        "field_name": "North Plot",
        "area": "2.5 Acres"
    }
    response = client.post("/fields/", json=field_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["field_name"] == "North Plot"
    assert data["farm_id"] == farm_id


def test_get_fields_by_farm_storage(client):
    farm_resp = client.post("/farms/", json={"farmer_name": "Kiran", "village": "V4", "district": "D4"}).json()
    farm_id = farm_resp["id"]

    client.post("/fields/", json={"farm_id": farm_id, "field_name": "Plot A", "area": "1.0 Acre"})
    client.post("/fields/", json={"farm_id": farm_id, "field_name": "Plot B", "area": "3.0 Acres"})

    response = client.get(f"/fields/farms/{farm_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


# -------------------------------------------------------------------
# IMAGES CLASSIFICATION STORAGE TESTS
# -------------------------------------------------------------------

def test_predict_image_storage(client):
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("soil_sample.jpg", img_bytes, "image/jpeg")}
    response = client.post("/images/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "image_id" in data
    assert "predicted_soil" in data
    assert "confidence" in data
    assert data["message"] == "Soil image classified successfully"


def test_get_image_metadata_storage(client):
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("sample_test.jpg", img_bytes, "image/jpeg")}
    upload_resp = client.post("/images/predict", files=files).json()
    img_id = upload_resp["image_id"]

    response = client.get(f"/images/{img_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["image_id"] == img_id
    assert data["filename"] == "sample_test.jpg"


def test_get_nonexistent_image_storage(client):
    response = client.get("/images/999999")
    assert response.status_code == 200
    assert response.json() == {"message": "Image not found"}


# -------------------------------------------------------------------
# FERTILIZER STORAGE & RECOMMENDATION TESTS
# -------------------------------------------------------------------

def test_fertilizer_recommendation_endpoint(client):
    response = client.post("/fertilizer/recommend?nitrogen=30&phosphorus=20&potassium=15")
    assert response.status_code == 200
    data = response.json()
    assert data["nitrogen"] == 30.0
    assert data["phosphorus"] == 20.0
    assert data["potassium"] == 15.0
    assert "deficiencies" in data
    assert "fertilizer_recommendation" in data
    assert "Urea" in data["fertilizer_recommendation"]
