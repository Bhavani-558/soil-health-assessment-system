def test_create_soil_record_valid(client):
    payload = {
        "field_id": 1,
        "nitrogen": "45.0",
        "phosphorus": "25.0",
        "potassium": "35.0",
        "ph": "6.5"
    }
    response = client.post("/soil-records/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["field_id"] == 1
    assert data["nitrogen"] == "45.0"
    assert data["phosphorus"] == "25.0"
    assert data["potassium"] == "35.0"
    assert data["ph"] == "6.5"
    assert "id" in data


def test_create_soil_record_missing_field(client):
    payload = {
        "field_id": 1,
        "nitrogen": "45.0",
        # missing phosphorus, potassium, ph
    }
    response = client.post("/soil-records/", json=payload)
    assert response.status_code == 422


def test_get_all_soil_records(client):
    client.post("/soil-records/", json={"field_id": 10, "nitrogen": "50", "phosphorus": "20", "potassium": "30", "ph": "6.8"})
    client.post("/soil-records/", json={"field_id": 11, "nitrogen": "60", "phosphorus": "25", "potassium": "35", "ph": "7.0"})

    response = client.get("/soil-records/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_get_soil_records_by_field_id(client):
    target_field_id = 99
    client.post("/soil-records/", json={"field_id": target_field_id, "nitrogen": "40", "phosphorus": "15", "potassium": "25", "ph": "6.0"})
    client.post("/soil-records/", json={"field_id": target_field_id, "nitrogen": "42", "phosphorus": "18", "potassium": "28", "ph": "6.2"})
    client.post("/soil-records/", json={"field_id": 100, "nitrogen": "70", "phosphorus": "30", "potassium": "40", "ph": "7.5"})

    response = client.get(f"/soil-records/by-field/{target_field_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(r["field_id"] == target_field_id for r in data)
