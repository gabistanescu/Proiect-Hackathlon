from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from src.config.database import Base

# Association table for professor subjects
professor_subjects = Table(
    'professor_subjects',
    Base.metadata,
    Column('professor_id', Integer, ForeignKey('professors.id')),
    Column('subject', String(100))
)

class Professor(Base):
    __tablename__ = 'professors'

    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    department = Column(String(255))
    subjects = Column(String(500))  # Comma-separated subjects
    phone = Column(String(20))
    
    # Relationships
    user = relationship("User", foreign_keys=[id])
    materials = relationship("Material", back_populates="professor", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="professor", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="professor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Professor(id={self.id}, department={self.department})>"