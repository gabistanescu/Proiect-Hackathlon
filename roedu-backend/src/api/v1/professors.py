from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_professors():
    """List all professors"""
    return {"message": "Professors endpoint - implementation needed"}

@router.get("/{professor_id}")
def get_professor(professor_id: int):
    """Get professor details"""
    return {"message": f"Get professor {professor_id} - implementation needed"}