from src.web.app import app
import pytest

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_index(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Welcome to the Game' in response.data  # Assuming the index.html contains this text

def test_game_endpoint(client):
    response = client.get('/api/game')
    assert response.status_code == 200
    # Add more assertions based on the expected response structure

def test_invalid_route(client):
    response = client.get('/invalid-route')
    assert response.status_code == 404