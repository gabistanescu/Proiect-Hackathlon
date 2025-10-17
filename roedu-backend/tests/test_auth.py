from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "wrongpassword"})
    assert response.status_code == 401
    assert "detail" in response.json()

def test_register_success():
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "newpassword",
        "role": "student"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"

def test_register_failure_existing_user():
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword",
        "role": "student"
    })
    assert response.status_code == 400
    assert "detail" in response.json()