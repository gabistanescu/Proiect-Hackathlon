from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime
import enum

class CommentType(str, enum.Enum):
    QUESTION = "question"  # Icon cu bec - întrebare
    FEEDBACK = "feedback"  # Feedback general
    SUGGESTION = "suggestion"  # Sugestie

class CommentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    comment_type = Column(SQLEnum(CommentType), default=CommentType.FEEDBACK)
    status = Column(SQLEnum(CommentStatus), default=CommentStatus.PENDING)
    material_id = Column(Integer, ForeignKey('materials.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    material = relationship("Material", back_populates="comments")
    user = relationship("User")

    def __repr__(self):
        return f"<Comment(id={self.id}, type={self.comment_type}, status={self.status})>"