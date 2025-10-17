from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)

class GroupCreate(GroupBase):
    student_ids: List[int] = []

class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)

class GroupResponse(GroupBase):
    id: int
    professor_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class GroupWithStudents(GroupResponse):
    student_count: int
    students: Optional[List[dict]] = []

class GroupAddStudentsRequest(BaseModel):
    student_ids: List[int] = Field(..., min_items=1)

class GroupRemoveStudentsRequest(BaseModel):
    student_ids: List[int] = Field(..., min_items=1)
