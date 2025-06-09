import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_get_game_status():
    response = client.get("/api/game/status")
    assert response.status_code == 200
    assert "status" in response.json()

def test_start_game():
    response = client.post("/api/game/start")
    assert response.status_code == 200
    assert response.json()["message"] == "Game started"

def test_end_game():
    response = client.post("/api/game/end")
    assert response.status_code == 200
    assert response.json()["message"] == "Game ended"