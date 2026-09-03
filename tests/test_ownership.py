def test_farm_field_soil_record_ownership_flow(client):
    # 1. Create a Farm for Farmer A
    farm_a = client.post("/farms/", json={
        "farmer_name": "Farmer A",
        "village": "Village Alpha",
        "district": "District One"
    }).json()
    farm_a_id = farm_a["id"]

    # 2. Create a Farm for Farmer B
    farm_b = client.post("/farms/", json={
        "farmer_name": "Farmer B",
        "village": "Village Beta",
        "district": "District Two"
    }).json()
    farm_b_id = farm_b["id"]

    # 3. Create Fields under Farm A
    field_a1 = client.post("/fields/", json={
        "farm_id": farm_a_id,
        "field_name": "Alpha North",
        "area": "5 Acres"
    }).json()
    field_a1_id = field_a1["id"]

    field_a2 = client.post("/fields/", json={
        "farm_id": farm_a_id,
        "field_name": "Alpha South",
        "area": "3 Acres"
    }).json()

    # 4. Create Field under Farm B
    field_b1 = client.post("/fields/", json={
        "farm_id": farm_b_id,
        "field_name": "Beta Plot",
        "area": "10 Acres"
    }).json()

    # Verify Fields query endpoint returns fields list with correct farm_id linking
    all_fields = client.get(f"/fields/farms/{farm_a_id}").json()
    assert isinstance(all_fields, list)
    farm_a_fields = [f for f in all_fields if f["farm_id"] == farm_a_id]
    farm_b_fields = [f for f in all_fields if f["farm_id"] == farm_b_id]
    assert len(farm_a_fields) == 2
    assert len(farm_b_fields) == 1

    # 5. Create Soil Records specifically for Field A1
    record_1 = client.post("/soil-records/", json={
        "field_id": field_a1_id,
        "nitrogen": "55.0",
        "phosphorus": "28.0",
        "potassium": "38.0",
        "ph": "6.7"
    }).json()

    record_2 = client.post("/soil-records/", json={
        "field_id": field_a1_id,
        "nitrogen": "52.0",
        "phosphorus": "26.0",
        "potassium": "36.0",
        "ph": "6.6"
    }).json()

    # Verify Soil Records isolated by Field A1 ID
    records_for_a1 = client.get(f"/soil-records/by-field/{field_a1_id}").json()
    assert len(records_for_a1) == 2
    assert all(r["field_id"] == field_a1_id for r in records_for_a1)
