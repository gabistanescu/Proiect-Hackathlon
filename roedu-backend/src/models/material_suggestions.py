"""
Models for Material Suggestions (GitHub-style Issues) and Feedback
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime
import enum

class SuggestionStatus(str, enum.Enum):
    OPEN = "open"  # Deschis
    RESOLVED = "resolved"  # Rezolvat
    CLOSED = "closed"  # Închis

class MaterialSuggestion(Base):
    """
    Sugestii/Task-uri pentru materiale (GitHub Issues style)
    Doar profesorii pot crea sugestii
    """
    __tablename__ = 'material_suggestions'

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey('materials.id'), nullable=False)
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)  # Cel care propune
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(SuggestionStatus), default=SuggestionStatus.OPEN)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    material = relationship("Material", back_populates="suggestions")
    professor = relationship("Professor", foreign_keys=[professor_id])
    comments = relationship("SuggestionComment", back_populates="suggestion", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MaterialSuggestion(id={self.id}, title={self.title}, status={self.status})>"


class SuggestionComment(Base):
    """
    Comentarii pe sugestii (doar profesori)
    """
    __tablename__ = 'suggestion_comments'

    id = Column(Integer, primary_key=True, index=True)
    suggestion_id = Column(Integer, ForeignKey('material_suggestions.id'), nullable=False)
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)
    
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    suggestion = relationship("MaterialSuggestion", back_populates="comments")
    professor = relationship("Professor")

    def __repr__(self):
        return f"<SuggestionComment(id={self.id}, suggestion_id={self.suggestion_id})>"


class MaterialFeedbackProfessor(Base):
    """
    Feedback de la profesori pe materiale (icon "bec" / "m-a ajutat")
    """
    __tablename__ = 'material_feedback_professors'

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey('materials.id'), nullable=False)
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)
    
    helpful = Column(Integer, default=1)  # 1 = helpful (bec aprins)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    material = relationship("Material", back_populates="feedback_professors")
    professor = relationship("Professor")

    def __repr__(self):
        return f"<MaterialFeedbackProfessor(material_id={self.material_id}, professor_id={self.professor_id})>"


class MaterialFeedbackStudent(Base):
    """
    Feedback de la studenți pe materiale (separat de profesori)
    """
    __tablename__ = 'material_feedback_students'

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey('materials.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    
    helpful = Column(Integer, default=1)  # 1 = helpful
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    material = relationship("Material", back_populates="feedback_students")
    student = relationship("Student")

    def __repr__(self):
        return f"<MaterialFeedbackStudent(material_id={self.material_id}, student_id={self.student_id})>"
