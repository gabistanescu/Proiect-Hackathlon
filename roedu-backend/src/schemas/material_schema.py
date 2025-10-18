from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ProfileType(str, Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

class MaterialBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None  # Rich text HTML content
    profile_type: Optional[ProfileType] = None
    subject: str = Field(..., min_length=1, max_length=100)
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    tags: Optional[List[str]] = []
    is_shared: bool = True

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
    is_shared: Optional[bool] = None
    last_reviewed: Optional[datetime] = None

class MaterialResponse(MaterialBase):
    id: int
    content: Optional[str] = None  # Rich text HTML content
    file_paths: List[str]
    professor_id: int
    last_reviewed: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class MaterialSearchParams(BaseModel):
    profile_type: Optional[ProfileType] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    tags: Optional[List[str]] = None
    search_query: Optional[str] = None
    professor_id: Optional[int] = None