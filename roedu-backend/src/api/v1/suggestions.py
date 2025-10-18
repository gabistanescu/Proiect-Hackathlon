"""
API endpoints for Material Suggestions (GitHub-style Issues)
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime

from src.config.database import get_db
from src.services.auth_service import get_current_user, require_role
from src.schemas.suggestion_schema import (
    SuggestionCreate, 
    SuggestionUpdate, 
    SuggestionResponse,
    SuggestionCommentCreate,
    SuggestionCommentResponse,
    SuggestionStatus
)
from src.models.user import User, UserRole
from src.models.material import Material, VisibilityType
from src.models.material_suggestions import MaterialSuggestion, SuggestionComment
from src.utils.helpers import paginate_results

router = APIRouter()


@router.post("/{material_id}/suggestions", response_model=SuggestionResponse, status_code=status.HTTP_201_CREATED)
def create_suggestion(
    material_id: int,
    suggestion_data: SuggestionCreate,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Create a new suggestion/issue for a material
    Only professors can create suggestions
    Cannot create suggestions on PRIVATE materials (unless owner)
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    # Check permissions - cannot suggest on private materials unless owner
    if material.visibility == VisibilityType.PRIVATE and material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create suggestions on private materials"
        )
    
    suggestion = MaterialSuggestion(
        material_id=material_id,
        professor_id=current_user.id,
        title=suggestion_data.title,
        description=suggestion_data.description,
        status=SuggestionStatus.OPEN
    )
    
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    
    suggestion.comments_count = 0
    return suggestion


@router.get("/{material_id}/suggestions", response_model=dict)
def list_suggestions(
    material_id: int,
    status_filter: str = Query(None, description="Filter by status: open, resolved, closed"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    List all suggestions for a material
    Only professors can view suggestions
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    
    query = db.query(MaterialSuggestion).filter(MaterialSuggestion.material_id == material_id)
    
    if status_filter:
        try:
            status_enum = SuggestionStatus(status_filter)
            query = query.filter(MaterialSuggestion.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be: open, resolved, or closed"
            )
    
    query = query.order_by(MaterialSuggestion.created_at.desc())
    
    result = paginate_results(query, page, page_size)
    
    # Add comment counts
    if 'items' in result:
        from sqlalchemy import func
        for suggestion in result['items']:
            suggestion.comments_count = db.query(func.count(SuggestionComment.id)).filter(
                SuggestionComment.suggestion_id == suggestion.id
            ).scalar() or 0
    
    return result


@router.get("/suggestions/{suggestion_id}", response_model=SuggestionResponse)
def get_suggestion(
    suggestion_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific suggestion
    Only professors can view suggestions
    """
    from sqlalchemy import func
    
    suggestion = db.query(MaterialSuggestion).filter(MaterialSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    
    # Add comment count
    suggestion.comments_count = db.query(func.count(SuggestionComment.id)).filter(
        SuggestionComment.suggestion_id == suggestion.id
    ).scalar() or 0
    
    return suggestion


@router.put("/suggestions/{suggestion_id}", response_model=SuggestionResponse)
def update_suggestion(
    suggestion_id: int,
    suggestion_data: SuggestionUpdate,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Update a suggestion (mainly to change status)
    Only material owner can change status to RESOLVED/CLOSED
    Suggestion creator can edit title/description
    """
    suggestion = db.query(MaterialSuggestion).filter(MaterialSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    
    material = db.query(Material).filter(Material.id == suggestion.material_id).first()
    
    # Check permissions
    is_owner = material.professor_id == current_user.id
    is_creator = suggestion.professor_id == current_user.id
    
    if not (is_owner or is_creator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only material owner or suggestion creator can update suggestions"
        )
    
    # Only owner can change status
    if suggestion_data.status and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only material owner can change suggestion status"
        )
    
    # Update fields
    update_data = suggestion_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'status' and value:
            setattr(suggestion, field, value)
            if value in [SuggestionStatus.RESOLVED, SuggestionStatus.CLOSED]:
                suggestion.resolved_at = datetime.utcnow()
        else:
            setattr(suggestion, field, value)
    
    db.commit()
    db.refresh(suggestion)
    
    # Add comment count
    from sqlalchemy import func
    suggestion.comments_count = db.query(func.count(SuggestionComment.id)).filter(
        SuggestionComment.suggestion_id == suggestion.id
    ).scalar() or 0
    
    return suggestion


@router.delete("/suggestions/{suggestion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_suggestion(
    suggestion_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Delete a suggestion
    Only suggestion creator or material owner can delete
    """
    suggestion = db.query(MaterialSuggestion).filter(MaterialSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    
    material = db.query(Material).filter(Material.id == suggestion.material_id).first()
    
    # Check permissions
    if suggestion.professor_id != current_user.id and material.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suggestion creator or material owner can delete"
        )
    
    db.delete(suggestion)
    db.commit()


# ============================================================================
# SUGGESTION COMMENTS
# ============================================================================

@router.post("/suggestions/{suggestion_id}/comments", response_model=SuggestionCommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    suggestion_id: int,
    comment_data: SuggestionCommentCreate,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Add a comment to a suggestion
    Only professors can comment
    """
    suggestion = db.query(MaterialSuggestion).filter(MaterialSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    
    comment = SuggestionComment(
        suggestion_id=suggestion_id,
        professor_id=current_user.id,
        content=comment_data.content
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Add professor name
    comment.professor_name = current_user.username
    
    return comment


@router.get("/suggestions/{suggestion_id}/comments", response_model=List[SuggestionCommentResponse])
def list_comments(
    suggestion_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Get all comments for a suggestion
    Only professors can view comments
    """
    suggestion = db.query(MaterialSuggestion).filter(MaterialSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suggestion not found")
    
    comments = db.query(SuggestionComment).filter(
        SuggestionComment.suggestion_id == suggestion_id
    ).order_by(SuggestionComment.created_at.asc()).all()
    
    # Add professor names
    for comment in comments:
        professor = db.query(User).filter(User.id == comment.professor_id).first()
        comment.professor_name = professor.username if professor else "Unknown"
    
    return comments


@router.delete("/suggestions/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(require_role([UserRole.PROFESSOR])),
    db: Session = Depends(get_db)
):
    """
    Delete a comment
    Only comment author can delete
    """
    comment = db.query(SuggestionComment).filter(SuggestionComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    
    if comment.professor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only comment author can delete"
        )
    
    db.delete(comment)
    db.commit()
