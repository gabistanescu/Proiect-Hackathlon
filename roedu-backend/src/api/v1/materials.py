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
from src.models.comment import Comment
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
    from src.models.material import VisibilityType
    
    material = Material(
        title=material_data.title,
        description=material_data.description,
        content=material_data.content,
        file_paths=serialize_json_field(material_data.file_paths),
        profile_type=material_data.profile_type,
        subject=material_data.subject,
        tags=serialize_tags(material_data.tags) if material_data.tags else "",
        grade_level=material_data.grade_level,
        visibility=material_data.visibility,
        is_shared=1 if material_data.is_shared else 0,
        professor_id=current_user.id
    )
    
    db.add(material)
    db.commit()
    db.refresh(material)
    
    # Convert string fields to lists for response
    material.tags = parse_tags(material.tags) if material.tags else []
    material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
    
    # Add counts for response
    material.feedback_professors_count = 0
    material.feedback_students_count = 0
    material.suggestions_count = 0
    material.comments_count = 0
    material.user_has_feedback = False
    
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List materials with filtering and pagination
    Visibility rules:
    - Students: only PUBLIC materials
    - Professors: ONLY their own materials (all visibility levels)
    """
    from src.models.material import VisibilityType
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent
    from sqlalchemy import func, case
    
    query = db.query(Material)
    
    # Apply visibility filter based on user role
    if current_user.role == UserRole.STUDENT:
        # Students see only PUBLIC materials
        query = query.filter(Material.visibility == VisibilityType.PUBLIC)
    elif current_user.role == UserRole.PROFESSOR:
        # Professors see ONLY their own materials
        query = query.filter(Material.professor_id == current_user.id)
    
    # Apply other filters
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
    
    # Get paginated results
    result = paginate_results(query, page, page_size)
    
    # Convert SQLAlchemy objects to Pydantic models for proper serialization
    if 'items' in result:
        materials_list = []
        for material in result['items']:
            # Parse JSON/string fields to lists
            material.tags = parse_tags(material.tags) if material.tags else []
            material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
            
            # Count feedback
            material.feedback_professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
                MaterialFeedbackProfessor.material_id == material.id
            ).scalar() or 0
            
            material.feedback_students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
                MaterialFeedbackStudent.material_id == material.id
            ).scalar() or 0
            
            # Count comments
            material.comments_count = db.query(func.count(Comment.id)).filter(
                Comment.material_id == material.id
            ).scalar() or 0
            
            # Check if current user has given feedback
            if current_user.role == UserRole.PROFESSOR:
                user_feedback = db.query(MaterialFeedbackProfessor).filter(
                    MaterialFeedbackProfessor.material_id == material.id,
                    MaterialFeedbackProfessor.professor_id == current_user.id
                ).first()
                material.user_has_feedback = user_feedback is not None
            elif current_user.role == UserRole.STUDENT:
                user_feedback = db.query(MaterialFeedbackStudent).filter(
                    MaterialFeedbackStudent.material_id == material.id,
                    MaterialFeedbackStudent.student_id == current_user.id
                ).first()
                material.user_has_feedback = user_feedback is not None
            else:
                material.user_has_feedback = False
            
            # Count suggestions (only for professors)
            material.suggestions_count = 0
            if current_user.role == UserRole.PROFESSOR:
                from src.models.material_suggestions import MaterialSuggestion
                material.suggestions_count = db.query(func.count(MaterialSuggestion.id)).filter(
                    MaterialSuggestion.material_id == material.id
                ).scalar() or 0
            
            # Convert to Pydantic model for serialization
            materials_list.append(MaterialResponse.model_validate(material))
        
        # Replace items with Pydantic models
        result['items'] = materials_list
    
    return result

@router.get("/feed/posts", response_model=dict)
def get_materials_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get materials feed based on visibility rules:
    - Students: only PUBLIC materials
    - Professors: PUBLIC + PROFESSORS_ONLY materials (from all professors)
    - Shows materials as a social feed, sorted by published_at (newest first)
    """
    from src.models.material import VisibilityType
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent
    from sqlalchemy import func
    
    query = db.query(Material)
    
    # Apply visibility filter based on user role
    if current_user.role == UserRole.STUDENT:
        # Students see only PUBLIC materials
        query = query.filter(Material.visibility == VisibilityType.PUBLIC)
    elif current_user.role == UserRole.PROFESSOR:
        # Professors see PUBLIC + PROFESSORS_ONLY materials from ALL professors
        query = query.filter(
            (Material.visibility == VisibilityType.PUBLIC) |
            (Material.visibility == VisibilityType.PROFESSORS_ONLY)
        )
    
    # Order by published_at (newest first) - like a social feed
    query = query.order_by(Material.published_at.desc())
    
    # Get paginated results
    result = paginate_results(query, page, page_size)
    
    # Convert SQLAlchemy objects to Pydantic models for proper serialization
    if 'items' in result:
        materials_list = []
        for material in result['items']:
            # Parse JSON/string fields to lists
            material.tags = parse_tags(material.tags) if material.tags else []
            material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
            
            # Count feedback based on visibility
            if current_user.role == UserRole.PROFESSOR or material.visibility == VisibilityType.PUBLIC:
                material.feedback_professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
                    MaterialFeedbackProfessor.material_id == material.id
                ).scalar() or 0
            else:
                material.feedback_professors_count = 0
            
            if material.visibility == VisibilityType.PUBLIC:
                material.feedback_students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
                    MaterialFeedbackStudent.material_id == material.id
                ).scalar() or 0
            else:
                material.feedback_students_count = 0
            
            # Count comments (always visible regardless of visibility)
            material.comments_count = db.query(func.count(Comment.id)).filter(
                Comment.material_id == material.id
            ).scalar() or 0
            
            # Check if current user has given feedback
            if current_user.role == UserRole.PROFESSOR:
                user_feedback = db.query(MaterialFeedbackProfessor).filter(
                    MaterialFeedbackProfessor.material_id == material.id,
                    MaterialFeedbackProfessor.professor_id == current_user.id
                ).first()
                material.user_has_feedback = user_feedback is not None
            elif current_user.role == UserRole.STUDENT:
                user_feedback = db.query(MaterialFeedbackStudent).filter(
                    MaterialFeedbackStudent.material_id == material.id,
                    MaterialFeedbackStudent.student_id == current_user.id
                ).first()
                material.user_has_feedback = user_feedback is not None
            else:
                material.user_has_feedback = False
            
            # Count suggestions (only for professors and visible materials)
            material.suggestions_count = 0
            if current_user.role == UserRole.PROFESSOR:
                from src.models.material_suggestions import MaterialSuggestion
                material.suggestions_count = db.query(func.count(MaterialSuggestion.id)).filter(
                    MaterialSuggestion.material_id == material.id
                ).scalar() or 0
            
            # Convert to Pydantic model for serialization
            materials_list.append(MaterialResponse.model_validate(material))
        
        # Replace items with Pydantic models
        result['items'] = materials_list
    
    return result

@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get material details by ID
    Checks visibility permissions
    """
    from src.models.material import VisibilityType
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent, MaterialSuggestion
    from sqlalchemy import func
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    # Check visibility permissions
    if material.visibility == VisibilityType.PRIVATE:
        if current_user.role != UserRole.PROFESSOR or material.professor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this material"
            )
    elif material.visibility == VisibilityType.PROFESSORS_ONLY:
        if current_user.role != UserRole.PROFESSOR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This material is only visible to professors"
            )
    
    # Add counts
    material.feedback_professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
        MaterialFeedbackProfessor.material_id == material.id
    ).scalar() or 0
    
    material.feedback_students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
        MaterialFeedbackStudent.material_id == material.id
    ).scalar() or 0
    
    material.suggestions_count = db.query(func.count(MaterialSuggestion.id)).filter(
        MaterialSuggestion.material_id == material.id
    ).scalar() or 0
    
    material.comments_count = db.query(func.count(Comment.id)).filter(
        Comment.material_id == material.id
    ).scalar() or 0
    
    # Check user feedback
    if current_user.role == UserRole.PROFESSOR:
        user_feedback = db.query(MaterialFeedbackProfessor).filter(
            MaterialFeedbackProfessor.material_id == material.id,
            MaterialFeedbackProfessor.professor_id == current_user.id
        ).first()
        material.user_has_feedback = user_feedback is not None
    elif current_user.role == UserRole.STUDENT:
        user_feedback = db.query(MaterialFeedbackStudent).filter(
            MaterialFeedbackStudent.material_id == material.id,
            MaterialFeedbackStudent.student_id == current_user.id
        ).first()
        material.user_has_feedback = user_feedback is not None
    
    # Convert string fields to lists for response
    material.tags = parse_tags(material.tags) if material.tags else []
    material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
    
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
    
    # Convert string fields to lists for response
    material.tags = parse_tags(material.tags) if material.tags else []
    material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
    
    # Add feedback counts
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent, MaterialSuggestion
    from sqlalchemy import func
    
    material.feedback_professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
        MaterialFeedbackProfessor.material_id == material.id
    ).scalar() or 0
    
    material.feedback_students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
        MaterialFeedbackStudent.material_id == material.id
    ).scalar() or 0
    
    material.suggestions_count = db.query(func.count(MaterialSuggestion.id)).filter(
        MaterialSuggestion.material_id == material.id
    ).scalar() or 0
    
    material.user_has_feedback = False
    
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
    
    # Convert string fields to lists for response
    material.tags = parse_tags(material.tags) if material.tags else []
    material.file_paths = parse_json_field(material.file_paths) if material.file_paths else []
    
    # Add feedback counts
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent, MaterialSuggestion
    from sqlalchemy import func
    
    material.feedback_professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
        MaterialFeedbackProfessor.material_id == material.id
    ).scalar() or 0
    
    material.feedback_students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
        MaterialFeedbackStudent.material_id == material.id
    ).scalar() or 0
    
    material.suggestions_count = db.query(func.count(MaterialSuggestion.id)).filter(
        MaterialSuggestion.material_id == material.id
    ).scalar() or 0
    
    material.user_has_feedback = False
    
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


# ============================================================================
# FEEDBACK ENDPOINTS
# ============================================================================

@router.post("/{material_id}/feedback/professor")
def toggle_professor_feedback(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Toggle professor feedback (helpful/not helpful) on a material
    Only professors can give professor feedback
    """
    from src.models.material_suggestions import MaterialFeedbackProfessor
    from src.models.material import VisibilityType
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    # Check if material allows feedback (not PRIVATE or is owner)
    if material.visibility == VisibilityType.PRIVATE and material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot give feedback on private materials"
        )
    
    # Check if feedback already exists
    existing_feedback = db.query(MaterialFeedbackProfessor).filter(
        MaterialFeedbackProfessor.material_id == material_id,
        MaterialFeedbackProfessor.professor_id == current_user.id
    ).first()
    
    if existing_feedback:
        # Remove feedback (toggle off)
        db.delete(existing_feedback)
        db.commit()
        return {
            "material_id": material_id,
            "user_id": current_user.id,
            "helpful": False,
            "message": "Feedback removed"
        }
    else:
        # Add feedback (toggle on)
        feedback = MaterialFeedbackProfessor(
            material_id=material_id,
            professor_id=current_user.id,
            helpful=1
        )
        db.add(feedback)
        db.commit()
        return {
            "material_id": material_id,
            "user_id": current_user.id,
            "helpful": True,
            "message": "Feedback added"
        }


@router.post("/{material_id}/feedback/student")
def toggle_student_feedback(
    material_id: int,
    current_user: User = Depends(require_role([UserRole.STUDENT])),
    db: Session = Depends(get_db)
):
    """
    Toggle student feedback (helpful/not helpful) on a material
    Only students can give student feedback, and only on PUBLIC materials
    """
    from src.models.material_suggestions import MaterialFeedbackStudent
    from src.models.material import VisibilityType
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    # Students can only feedback PUBLIC materials
    if material.visibility != VisibilityType.PUBLIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only give feedback on public materials"
        )
    
    # Check if feedback already exists
    existing_feedback = db.query(MaterialFeedbackStudent).filter(
        MaterialFeedbackStudent.material_id == material_id,
        MaterialFeedbackStudent.student_id == current_user.id
    ).first()
    
    if existing_feedback:
        # Remove feedback (toggle off)
        db.delete(existing_feedback)
        db.commit()
        return {
            "material_id": material_id,
            "user_id": current_user.id,
            "helpful": False,
            "message": "Feedback removed"
        }
    else:
        # Add feedback (toggle on)
        feedback = MaterialFeedbackStudent(
            material_id=material_id,
            student_id=current_user.id,
            helpful=1
        )
        db.add(feedback)
        db.commit()
        return {
            "material_id": material_id,
            "user_id": current_user.id,
            "helpful": True,
            "message": "Feedback added"
        }


@router.get("/{material_id}/feedback")
def get_material_feedback(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get feedback statistics for a material
    Returns separate counts for professors and students
    """
    from src.models.material_suggestions import MaterialFeedbackProfessor, MaterialFeedbackStudent
    from sqlalchemy import func
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    professors_count = db.query(func.count(MaterialFeedbackProfessor.id)).filter(
        MaterialFeedbackProfessor.material_id == material_id
    ).scalar() or 0
    
    students_count = db.query(func.count(MaterialFeedbackStudent.id)).filter(
        MaterialFeedbackStudent.material_id == material_id
    ).scalar() or 0
    
    # Check if current user has given feedback
    user_has_feedback = False
    if current_user.role == UserRole.PROFESSOR:
        user_feedback = db.query(MaterialFeedbackProfessor).filter(
            MaterialFeedbackProfessor.material_id == material_id,
            MaterialFeedbackProfessor.professor_id == current_user.id
        ).first()
        user_has_feedback = user_feedback is not None
    elif current_user.role == UserRole.STUDENT:
        user_feedback = db.query(MaterialFeedbackStudent).filter(
            MaterialFeedbackStudent.material_id == material_id,
            MaterialFeedbackStudent.student_id == current_user.id
        ).first()
        user_has_feedback = user_feedback is not None
    
    return {
        "material_id": material_id,
        "professors_count": professors_count,
        "students_count": students_count,
        "user_has_feedback": user_has_feedback
    }