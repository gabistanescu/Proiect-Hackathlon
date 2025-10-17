from fastapi.testclient import TestClient
from src.main import app
from src.models.material import Material
from src.schemas.material_schema import MaterialSchema

client = TestClient(app)

def test_create_material():
    response = client.post("/api/v1/materials/", json={
        "title": "Test Material",
        "description": "This is a test material.",
        "tags": ["test", "material"],
        "profile": "real"
    })
    assert response.status_code == 201
    material = Material(**response.json())
    assert material.title == "Test Material"
    assert material.description == "This is a test material."
    assert "test" in material.tags

def test_get_materials():
    response = client.get("/api/v1/materials/")
    assert response.status_code == 200
    materials = response.json()
    assert isinstance(materials, list)

def test_update_material():
    # Assuming a material with ID 1 exists
    response = client.put("/api/v1/materials/1", json={
        "title": "Updated Material",
        "description": "This is an updated test material.",
        "tags": ["updated", "material"],
        "profile": "real"
    })
    assert response.status_code == 200
    updated_material = Material(**response.json())
    assert updated_material.title == "Updated Material"

def test_delete_material():
    # Assuming a material with ID 1 exists
    response = client.delete("/api/v1/materials/1")
    assert response.status_code == 204

def test_material_schema_validation():
    invalid_material_data = {
        "title": "",
        "description": "This material has no title.",
        "tags": ["invalid"],
        "profile": "real"
    }
    with pytest.raises(ValidationError):
        MaterialSchema(**invalid_material_data)