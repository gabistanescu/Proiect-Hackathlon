from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.schemas.group_schema import (
    GroupCreate, GroupResponse, GroupWithStudents, 
    GroupUpdate, GroupAddStudentsRequest, GroupRemoveStudentsRequest
)
from src.schemas.user_schema import UserResponse
from src.models.group import Group
from src.models.student import Student
from src.models.user import User
from src.models.professor import Professor
from typing import List
from datetime import datetime

router = APIRouter(tags=["groups"])

def get_current_professor_id(db: Session) -> int:
    """Helper to get current professor ID from auth (TODO: implement auth)"""
    # This should be implemented with proper authentication
    # For now, get the first professor or default to 1
    first_professor = db.query(Professor).first()
    if first_professor:
        return first_professor.id
    # If no professor exists, return 1 (will be created on demand if needed)
    return 1

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db)
):
    """Create a new student group with email-based student selection"""
    professor_id = get_current_professor_id(db)
    
    # Verify professor exists, if not just proceed with ID 1 for testing
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        # For development, we'll still allow group creation even if professor doesn't exist yet
        # In production, this should require proper authentication
        pass
    
    # Create new group
    new_group = Group(
        name=group_data.name,
        description=group_data.description,
        subject=group_data.subject,
        grade_level=group_data.grade_level,
        professor_id=professor_id,
        created_at=datetime.utcnow()
    )
    
    # Add students by email
    if group_data.student_emails:
        students = db.query(Student).join(User).filter(
            User.email.in_(group_data.student_emails)
        ).all()
        
        if len(students) < len(group_data.student_emails):
            missing_emails = set(group_data.student_emails) - {s.user.email for s in students}
            raise HTTPException(
                status_code=400, 
                detail=f"Students not found for emails: {missing_emails}"
            )
        
        new_group.students = students
    
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    return GroupResponse.model_validate(new_group)

@router.get("/", response_model=List[GroupWithStudents])
def get_professor_groups(db: Session = Depends(get_db)):
    """Get all groups for the current professor"""
    professor_id = get_current_professor_id(db)
    
    # Get groups for this professor (even if professor doesn't exist in DB yet for development)
    groups = db.query(Group).filter(Group.professor_id == professor_id).all()
    
    result = []
    for group in groups:
        result.append(GroupWithStudents(
            **{**GroupResponse.model_validate(group).model_dump(), 
               "student_count": len(group.students) if group.students else 0,
               "students": [
                   {
                       "id": s.id,
                       "email": s.user.email if s.user else "",
                       "first_name": s.user.first_name if s.user else "",
                       "last_name": s.user.last_name if s.user else ""
                   }
                   for s in (group.students or [])
               ]}
        ))
    
    return result

@router.get("/{group_id}", response_model=GroupWithStudents)
def get_group(group_id: int, db: Session = Depends(get_db)):
    """Get a specific group with all its students"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    professor_id = get_current_professor_id(db)
    if group.professor_id != professor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return GroupWithStudents(
        **{**GroupResponse.model_validate(group).model_dump(),
           "student_count": len(group.students),
           "students": [
               {
                   "id": s.id,
                   "email": s.user.email,
                   "first_name": s.user.first_name,
                   "last_name": s.user.last_name
               }
               for s in group.students
           ]}
    )

@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db)
):
    """Update group information"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    professor_id = get_current_professor_id(db)
    if group.professor_id != professor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Update fields
    if group_data.name:
        group.name = group_data.name
    if group_data.description is not None:
        group.description = group_data.description
    if group_data.subject is not None:
        group.subject = group_data.subject
    if group_data.grade_level is not None:
        group.grade_level = group_data.grade_level
    
    group.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(group)
    
    return GroupResponse.model_validate(group)

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    """Delete a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    professor_id = get_current_professor_id(db)
    if group.professor_id != professor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    db.delete(group)
    db.commit()

@router.post("/{group_id}/students/add")
def add_students_to_group(
    group_id: int,
    request: GroupAddStudentsRequest,
    db: Session = Depends(get_db)
):
    """Add students to a group by email"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    professor_id = get_current_professor_id(db)
    if group.professor_id != professor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Find students by email
    students = db.query(Student).join(User).filter(
        User.email.in_(request.student_emails)
    ).all()
    
    if len(students) < len(request.student_emails):
        missing_emails = set(request.student_emails) - {s.user.email for s in students}
        raise HTTPException(
            status_code=400,
            detail=f"Students not found for emails: {missing_emails}"
        )
    
    # Add students to group (avoid duplicates)
    for student in students:
        if student not in group.students:
            group.students.append(student)
    
    db.commit()
    
    return {"message": f"Added {len(students)} students to group"}

@router.post("/{group_id}/students/remove")
def remove_students_from_group(
    group_id: int,
    request: GroupRemoveStudentsRequest,
    db: Session = Depends(get_db)
):
    """Remove students from a group"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    professor_id = get_current_professor_id(db)
    if group.professor_id != professor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Remove students
    group.students = [s for s in group.students if s.id not in request.student_ids]
    
    db.commit()
    
    return {"message": f"Removed {len(request.student_ids)} students from group"}
