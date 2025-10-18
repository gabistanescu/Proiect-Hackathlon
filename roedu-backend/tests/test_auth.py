from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@roedu.ro", "password": "Admin123!"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@roedu.ro", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()
