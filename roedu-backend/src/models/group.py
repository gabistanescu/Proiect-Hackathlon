from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime

class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)
    subject = Column(String(100))
    grade_level = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    professor = relationship("Professor", back_populates="groups")
    students = relationship("Student", secondary="student_groups", back_populates="groups")
    quizzes = relationship("Quiz", back_populates="group")

    def __repr__(self):
        return f"<Group(id={self.id}, name={self.name}, professor_id={self.professor_id})>"