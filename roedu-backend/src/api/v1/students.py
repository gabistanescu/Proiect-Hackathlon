from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from src.config.database import get_db
from src.services.auth_service import get_current_user
from src.models.user import User
from src.models.student import Student, ProfileType
from src.models.material import Material
from src.models.quiz import QuizAttempt
from src.schemas.user_schema import StudentResponse, StudentUpdate
from src.schemas.material_schema import MaterialResponse
from src.schemas.quiz_schema import QuizAttemptResponse

router = APIRouter()

@router.get("/", response_model=List[StudentResponse])
def list_students(
    profile_type: Optional[ProfileType] = Query(None, description="Filter by profile type"),
    grade_level: Optional[int] = Query(None, ge=9, le=12, description="Filter by grade level"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all students with optional filters (admin and professors only)
    """
    if current_user.role.value not in ["administrator", "professor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and professors can list students"
        )
    
    query = db.query(Student)
    
    if profile_type:
        query = query.filter(Student.profile_type == profile_type)
    
    if grade_level:
        query = query.filter(Student.grade_level == grade_level)
    
    students = query.offset(skip).limit(limit).all()
    
    # Build response with user data
    result = []
    for student in students:
        user = db.query(User).filter(User.id == student.id).first()
        result.append({
            **user.__dict__,
            **student.__dict__
        })
    
    return result

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student details (self, professors, or admin only)
    """
    if (current_user.id != student_id and 
        current_user.role.value not in ["administrator", "professor"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this student"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    user = db.query(User).filter(User.id == student.id).first()
    return {**user.__dict__, **student.__dict__}

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update student profile (self or admin only)
    """
    if current_user.id != student_id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this student"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Update fields
    update_data = student_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(student, field):
            setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    
    user = db.query(User).filter(User.id == student.id).first()
    return {**user.__dict__, **student.__dict__}

@router.get("/{student_id}/saved-materials", response_model=List[MaterialResponse])
def get_saved_materials(
    student_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student's saved materials (self only)
    """
    if current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view saved materials"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get saved materials through the relationship
    materials = student.saved_materials[skip:skip+limit]
    return materials

@router.post("/{student_id}/saved-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def save_material(
    student_id: int,
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a material for later (self only)
    """
    if current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Add material to saved if not already saved
    if material not in student.saved_materials:
        student.saved_materials.append(material)
        db.commit()
    
    return None

@router.delete("/{student_id}/saved-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_material(
    student_id: int,
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a saved material (self only)
    """
    if current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Remove material from saved
    if material in student.saved_materials:
        student.saved_materials.remove(material)
        db.commit()
    
    return None

@router.get("/{student_id}/quiz-attempts", response_model=List[QuizAttemptResponse])
def get_quiz_attempts(
    student_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get student's quiz attempts (self, professors, or admin)
    """
    if (current_user.id != student_id and 
        current_user.role.value not in ["administrator", "professor"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view quiz attempts"
        )
    
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == student_id
    ).offset(skip).limit(limit).all()
    
    return attempts

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a student account (admin only)
    """
    if current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete student accounts"
        )
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Delete user (cascades to student)
    user = db.query(User).filter(User.id == student_id).first()
    db.delete(user)
    db.commit()
    return None