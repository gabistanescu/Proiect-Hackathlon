from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_comments():
    """List all comments"""
    return {"message": "Comments endpoint - implementation needed"}