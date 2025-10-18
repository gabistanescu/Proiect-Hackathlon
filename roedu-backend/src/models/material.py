from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime
import enum

class ProfileType(str, enum.Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

class VisibilityType(str, enum.Enum):
    PUBLIC = "public"  # Oricine - vizibil pentru toți
    PROFESSORS_ONLY = "professors_only"  # Doar profesorii
    PRIVATE = "private"  # Doar eu (owner)

class Material(Base):
    __tablename__ = 'materials'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    content = Column(Text)  # Rich text HTML content
    file_paths = Column(Text)  # JSON string for multiple files
    profile_type = Column(SQLEnum(ProfileType))
    subject = Column(String(100), index=True)  # Materia
    tags = Column(Text)  # JSON string: clasa, optional, etc.
    grade_level = Column(Integer)  # Clasa (9, 10, 11, 12)
    
    # Visibility settings
    visibility = Column(SQLEnum(VisibilityType), default=VisibilityType.PUBLIC)
    is_shared = Column(Integer, default=1)  # Deprecated - kept for compatibility
    
    # Metadata
    last_reviewed = Column(DateTime)
    published_at = Column(DateTime, default=datetime.utcnow)
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    professor = relationship("Professor", back_populates="materials")
    comments = relationship("Comment", back_populates="material", cascade="all, delete-orphan")
    saved_by_students = relationship("Student", secondary="student_saved_materials", back_populates="saved_materials")
    suggestions = relationship("MaterialSuggestion", back_populates="material", cascade="all, delete-orphan")
    feedback_professors = relationship("MaterialFeedbackProfessor", back_populates="material", cascade="all, delete-orphan")
    feedback_students = relationship("MaterialFeedbackStudent", back_populates="material", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Material(id={self.id}, title={self.title}, subject={self.subject})>"