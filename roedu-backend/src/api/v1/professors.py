from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.config.database import get_db
from src.services.auth_service import get_current_user
from src.models.user import User
from src.models.professor import Professor
from src.models.material import Material
from src.models.quiz import Quiz
from src.schemas.user_schema import ProfessorResponse, ProfessorUpdate
from src.schemas.material_schema import MaterialResponse
from src.schemas.quiz_schema import QuizResponse

router = APIRouter()

@router.get("/", response_model=List[ProfessorResponse])
def list_professors(
    department: Optional[str] = Query(None, description="Filter by department"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all professors with optional filters
    """
    query = db.query(Professor)
    
    if department:
        query = query.filter(Professor.department.contains(department))
    
    professors = query.offset(skip).limit(limit).all()
    
    # Build response with user data
    result = []
    for prof in professors:
        user = db.query(User).filter(User.id == prof.id).first()
        result.append({
            **user.__dict__,
            **prof.__dict__
        })
    
    return result

@router.get("/{professor_id}", response_model=ProfessorResponse)
def get_professor(
    professor_id: int,
    db: Session = Depends(get_db)
):
    """
    Get professor details by ID
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    user = db.query(User).filter(User.id == professor.id).first()
    return {**user.__dict__, **professor.__dict__}

@router.put("/{professor_id}", response_model=ProfessorResponse)
def update_professor(
    professor_id: int,
    professor_data: ProfessorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update professor profile (self or admin only)
    """
    # Check permissions
    if current_user.id != professor_id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this professor"
        )
    
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    # Update fields
    update_data = professor_data.model_dump(exclude_unset=True)
    
    # Handle password update
    if "password" in update_data:
        from src.services.auth_service import AuthService
        user = db.query(User).filter(User.id == professor_id).first()
        user.hashed_password = AuthService.get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        if hasattr(professor, field):
            setattr(professor, field, value)
    
    db.commit()
    db.refresh(professor)
    
    user = db.query(User).filter(User.id == professor.id).first()
    return {**user.__dict__, **professor.__dict__}

@router.get("/{professor_id}/materials", response_model=List[MaterialResponse])
def get_professor_materials(
    professor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all materials created by a professor
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    materials = db.query(Material).filter(
        Material.professor_id == professor_id
    ).offset(skip).limit(limit).all()
    
    return materials

@router.get("/{professor_id}/quizzes", response_model=List[QuizResponse])
def get_professor_quizzes(
    professor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all quizzes created by a professor
    """
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    quizzes = db.query(Quiz).filter(
        Quiz.professor_id == professor_id
    ).offset(skip).limit(limit).all()
    
    return quizzes

@router.get("/{professor_id}/saved-materials", response_model=List[dict])
def get_professor_saved_materials(
    professor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get materials saved by a professor (self or admin only)
    Professors can save other professors' materials for reference
    """
    # Check permissions
    if professor_id != current_user.id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this professor's saved materials"
        )
    
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    # Get saved materials from professor's saved_materials relationship
    # This assumes there's a many-to-many relationship in the Professor model
    saved_materials = professor.saved_materials[skip:skip+limit] if hasattr(professor, 'saved_materials') else []
    
    return saved_materials

@router.delete("/{professor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_professor(
    professor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a professor account (admin only)
    """
    if current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete professor accounts"
        )
    
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    # Delete user (cascades to professor)
    user = db.query(User).filter(User.id == professor_id).first()
    db.delete(user)
    db.commit()
    return None