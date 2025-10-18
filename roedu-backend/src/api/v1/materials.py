from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import os
import uuid
from pathlib import Path

from src.config.database import get_db
from src.config.settings import settings
from src.services.auth_service import get_current_user, require_role
from src.schemas.material_schema import (
    MaterialCreate, MaterialUpdate, MaterialResponse, MaterialSearchParams
)
from src.models.user import User, UserRole
from src.models.material import Material
from src.models.student import Student
from src.utils.helpers import paginate_results, parse_tags, serialize_tags, parse_json_field, serialize_json_field

router = APIRouter()

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt"}

def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save uploaded file and return the file path
    """
    # Validate file extension
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = upload_file.file.read()
            
            # Check file size
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return relative path for database storage
    return f"/uploads/{unique_filename}"

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
):
    """
    Upload a file (PDF, DOC, etc.) for a material
    Returns the file path that can be used when creating/updating a material
    """
    file_path = save_upload_file(file)
    
    return {
        "filename": file.filename,
        "file_path": file_path,
        "message": "File uploaded successfully"
    }

@router.post("/", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(
    material_data: MaterialCreate,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Create a new material (Professors only)
    """
    material = Material(
        title=material_data.title,
        description=material_data.description,
        content=material_data.content,
        file_paths=serialize_json_field(material_data.file_paths),
        profile_type=material_data.profile_type,
        subject=material_data.subject,
        tags=serialize_tags(material_data.tags) if material_data.tags else "",
        grade_level=material_data.grade_level,
        is_shared=1 if material_data.is_shared else 0,
        professor_id=current_user.id
    )
    
    db.add(material)
    db.commit()
    db.refresh(material)
    
    return material

@router.get("/", response_model=dict)
def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    profile_type: Optional[str] = None,
    subject: Optional[str] = None,
    grade_level: Optional[int] = Query(None, ge=9, le=12),
    search: Optional[str] = None,
    professor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List materials with filtering and pagination
    """
    query = db.query(Material).filter(Material.is_shared == 1)
    
    if profile_type:
        query = query.filter(Material.profile_type == profile_type)
    if subject:
        query = query.filter(Material.subject.ilike(f"%{subject}%"))
    if grade_level:
        query = query.filter(Material.grade_level == grade_level)
    if professor_id:
        query = query.filter(Material.professor_id == professor_id)
    if search:
        query = query.filter(
            (Material.title.ilike(f"%{search}%")) |
            (Material.description.ilike(f"%{search}%"))
        )
    
    query = query.order_by(Material.created_at.desc())
    
    return paginate_results(query, page, page_size)

@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    """
    Get material details by ID
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    return material

@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    material_data: MaterialUpdate,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Update material (only by owner professor)
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    if material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this material"
        )
    
    # Update fields
    update_data = material_data.model_dump(exclude_unset=True)
    if 'tags' in update_data and update_data['tags'] is not None:
        update_data['tags'] = serialize_tags(update_data['tags'])
    if 'is_shared' in update_data:
        update_data['is_shared'] = 1 if update_data['is_shared'] else 0
    
    for field, value in update_data.items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    
    return material

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR, UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    """
    Delete material (by owner professor or administrator)
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Only owner professor or admin can delete
    if current_user.role == UserRole.PROFESSOR and material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this material"
        )
    
    db.delete(material)
    db.commit()

@router.post("/{material_id}/save", status_code=status.HTTP_200_OK)
def save_material(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """
    Save material to student's saved list
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    student = db.query(Student).filter(Student.id == current_user.id).first()
    if material not in student.saved_materials:
        student.saved_materials.append(material)
        db.commit()
    
    return {"message": "Material saved successfully"}

@router.delete("/{material_id}/save", status_code=status.HTTP_200_OK)
def unsave_material(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """
    Remove material from student's saved list
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    student = db.query(Student).filter(Student.id == current_user.id).first()
    if material in student.saved_materials:
        student.saved_materials.remove(material)
        db.commit()
    
    return {"message": "Material unsaved successfully"}

@router.get("/my/saved", response_model=dict)
def get_saved_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """
    Get student's saved materials
    """
    student = db.query(Student).filter(Student.id == current_user.id).first()
    
    # Create a query from the saved materials
    material_ids = [m.id for m in student.saved_materials]
    query = db.query(Material).filter(Material.id.in_(material_ids))
    
    return paginate_results(query, page, page_size)

@router.post("/{material_id}/mark-reviewed", response_model=MaterialResponse)
def mark_material_reviewed(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Mark material as reviewed (for annual review tasks)
    Only owner professor can mark their materials as reviewed
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    if material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to review this material"
        )
    
    material.last_reviewed = datetime.utcnow()
    db.commit()
    db.refresh(material)
    
    return material

@router.get("/needs-review", response_model=dict)
def get_materials_needing_review(
    months_threshold: int = Query(12, ge=1, description="Materials not reviewed in X months"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Get materials that need annual review
    Returns materials owned by current professor that haven't been reviewed in X months
    """
    from datetime import timedelta
    threshold_date = datetime.utcnow() - timedelta(days=months_threshold * 30)
    
    query = db.query(Material).filter(
        Material.professor_id == current_user.id,
        (Material.last_reviewed.is_(None)) | (Material.last_reviewed < threshold_date)
    )
    
    return paginate_results(query, page, page_size)

@router.post("/{material_id}/ask-ai")
def ask_ai_about_material(
    material_id: int,
    question: str = Query(..., min_length=1, description="Question to ask about the material"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ask AI questions about a specific material
    Available to all authenticated users
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Import AI service
    from src.services.ai_service import ask_ai_about_material as ai_ask
    
    try:
        response = ai_ask(material, question, db)
        return {
            "material_id": material_id,
            "question": question,
            "answer": response
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )