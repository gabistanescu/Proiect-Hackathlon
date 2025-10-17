from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.models.administrator import Administrator
from src.models.user import User, UserRole
from src.schemas.user_schema import AdministratorCreate, AdministratorResponse, AdministratorUpdate
from src.services.auth_service import get_current_user, require_role
from src.config.database import get_db

router = APIRouter()

@router.get("/", response_model=list[dict])
def list_administrators(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR]))
):
    """List all administrators (admin only)"""
    administrators = db.query(Administrator).join(User).all()
    return [
        {
            "id": admin.id,
            "username": admin.user.username if admin.user else None,
            "email": admin.user.email if admin.user else None,
            "school_name": admin.school_name,
            "phone": admin.phone
        }
        for admin in administrators
    ]

@router.get("/{administrator_id}")
def get_administrator(
    administrator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR]))
):
    """Get administrator details"""
    admin = db.query(Administrator).filter(Administrator.id == administrator_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrator not found")
    
    user = db.query(User).filter(User.id == admin.id).first()
    return {
        "id": admin.id,
        "username": user.username if user else None,
        "email": user.email if user else None,
        "school_name": admin.school_name,
        "phone": admin.phone,
        "last_password_change": admin.last_password_change
    }

@router.put("/{administrator_id}")
def update_administrator(
    administrator_id: int,
    admin_data: AdministratorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR]))
):
    """Update administrator"""
    admin = db.query(Administrator).filter(Administrator.id == administrator_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrator not found")
    
    # Update fields
    update_data = admin_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(admin, field):
            setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    
    user = db.query(User).filter(User.id == admin.id).first()
    return {
        "id": admin.id,
        "username": user.username if user else None,
        "email": user.email if user else None,
        "school_name": admin.school_name,
        "phone": admin.phone
    }

@router.delete("/{administrator_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_administrator(
    administrator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR]))
):
    """Delete administrator"""
    admin = db.query(Administrator).filter(Administrator.id == administrator_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrator not found")
    
    user = db.query(User).filter(User.id == admin.id).first()
    if user:
        db.delete(user)
    db.delete(admin)
    db.commit()