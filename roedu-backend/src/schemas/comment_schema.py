from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class CommentType(str, Enum):
    QUESTION = "question"
    FEEDBACK = "feedback"
    SUGGESTION = "suggestion"

class CommentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)
    comment_type: CommentType = CommentType.FEEDBACK
    material_id: int

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    comment_type: Optional[CommentType] = None
    status: Optional[CommentStatus] = None

class CommentResponse(CommentBase):
    id: int
    user_id: int
    status: CommentStatus
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CommentWithUser(CommentResponse):
    username: str
    user_email: str