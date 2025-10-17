from fastapi.testclient import TestClient
from src.main import app
from src.models.quiz import Quiz
from src.repositories.quiz_repository import QuizRepository

client = TestClient(app)

def test_create_quiz():
    response = client.post("/api/v1/quizzes/", json={
        "title": "Sample Quiz",
        "questions": [
            {"question": "What is 2 + 2?", "options": ["3", "4", "5"], "correct_answer": "4"},
            {"question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris"], "correct_answer": "Paris"}
        ],
        "tags": ["math", "geography"]
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Sample Quiz"

def test_get_quiz():
    response = client.get("/api/v1/quizzes/1")
    assert response.status_code == 200
    assert "title" in response.json()

def test_update_quiz():
    response = client.put("/api/v1/quizzes/1", json={
        "title": "Updated Quiz Title"
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Quiz Title"

def test_delete_quiz():
    response = client.delete("/api/v1/quizzes/1")
    assert response.status_code == 204

def test_get_all_quizzes():
    response = client.get("/api/v1/quizzes/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)