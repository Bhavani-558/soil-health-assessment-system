from unittest.mock import MagicMock, patch
from app.main import sarvam_client


def test_generate_voice_valid_hindi(client):
    mock_response = MagicMock()
    mock_response.audios = ["base64_audio_string_mock_123"]

    with patch.object(sarvam_client.text_to_speech, "convert", return_value=mock_response):
        payload = {"text": "नमस्ते, आपकी मिट्टी का स्वास्थ्य अच्छा है।", "language": "hi"}
        response = client.post("/api/voice", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["language"] == "hi-IN"
        assert data["audio"] == "base64_audio_string_mock_123"


def test_generate_voice_language_mapping_kannada(client):
    mock_response = MagicMock()
    mock_response.audios = ["kannada_audio_b64"]

    with patch.object(sarvam_client.text_to_speech, "convert", return_value=mock_response):
        payload = {"text": "ನಿಮ್ಮ ಮಣ್ಣಿನ ವರದಿ ತಯಾರಾಗಿದೆ.", "language": "kn"}
        response = client.post("/api/voice", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "kn-IN"
        assert data["audio"] == "kannada_audio_b64"


def test_generate_voice_language_mapping_english(client):
    mock_response = MagicMock()
    mock_response.audios = ["english_audio_b64"]

    with patch.object(sarvam_client.text_to_speech, "convert", return_value=mock_response):
        payload = {"text": "Soil test complete.", "language": "en"}
        response = client.post("/api/voice", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "en-IN"


def test_generate_voice_missing_text(client):
    payload = {"language": "hi"}  # missing text
    response = client.post("/api/voice", json=payload)
    assert response.status_code == 422


def test_generate_voice_service_exception(client):
    with patch.object(sarvam_client.text_to_speech, "convert", side_effect=RuntimeError("Sarvam AI Service Unavailable")):
        payload = {"text": "Test speech", "language": "en"}
        response = client.post("/api/voice", json=payload)
        assert response.status_code == 500
        assert "Sarvam AI Service Unavailable" in response.json()["detail"]
