from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_students():
    """List all students"""
    return {"message": "Students endpoint - implementation needed"}