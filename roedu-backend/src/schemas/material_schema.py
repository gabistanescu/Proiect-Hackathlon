from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ProfileType(str, Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

class VisibilityType(str, Enum):
    PUBLIC = "public"  # Oricine - vizibil pentru toți
    PROFESSORS_ONLY = "professors_only"  # Doar profesorii
    PRIVATE = "private"  # Doar eu (owner)

class MaterialBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None  # Rich text HTML content
    profile_type: Optional[ProfileType] = None
    subject: str = Field(..., min_length=1, max_length=100)
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    tags: Optional[List[str]] = []
    visibility: VisibilityType = VisibilityType.PUBLIC
    is_shared: bool = True  # Deprecated, kept for compatibility

class MaterialCreate(MaterialBase):
    file_paths: Optional[List[str]] = []

class MaterialUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None  # Rich text HTML content
    profile_type: Optional[ProfileType] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=100)
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    tags: Optional[List[str]] = None
    visibility: Optional[VisibilityType] = None
    is_shared: Optional[bool] = None
    last_reviewed: Optional[datetime] = None

class MaterialResponse(MaterialBase):
    id: int
    content: Optional[str] = None  # Rich text HTML content
    file_paths: List[str]
    professor_id: int
    visibility: VisibilityType
    published_at: datetime
    last_reviewed: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Feedback counts
    feedback_professors_count: int = 0
    feedback_students_count: int = 0
    suggestions_count: int = 0
    user_has_feedback: bool = False
    
    model_config = ConfigDict(from_attributes=True)

class MaterialSearchParams(BaseModel):
    profile_type: Optional[ProfileType] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    tags: Optional[List[str]] = None
    search_query: Optional[str] = None
    professor_id: Optional[int] = None
    visibility: Optional[VisibilityType] = None