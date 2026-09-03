def test_cors_preflight_headers(client):
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/predict/", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_public_endpoint_access_without_tokens(client):
    """Verify public system routes respond without requiring auth credentials."""
    resp_root = client.get("/")
    assert resp_root.status_code == 200

    resp_health = client.get("/health")
    assert resp_health.status_code == 200


def test_invalid_authorization_header_handling(client):
    """Verify backend endpoints operate smoothly even when client passes custom/extra headers."""
    headers = {"Authorization": "Bearer invalid_token_12345"}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
