from sqlalchemy import Column, Integer, String, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.config.database import Base
import enum

class ProfileType(str, enum.Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

# Association tables
student_saved_materials = Table(
    'student_saved_materials',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('material_id', Integer, ForeignKey('materials.id'))
)

student_groups = Table(
    'student_groups',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)

class Student(Base):
    __tablename__ = 'students'

    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    profile_type = Column(SQLEnum(ProfileType), nullable=False, default=ProfileType.UMAN)
    grade_level = Column(Integer)  # Clasa (9, 10, 11, 12)
    school_name = Column(String(255))
    
    # Relationships
    user = relationship("User", foreign_keys=[id])
    saved_materials = relationship("Material", secondary=student_saved_materials, back_populates="saved_by_students")
    groups = relationship("Group", secondary=student_groups, back_populates="students")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student(id={self.id}, profile_type={self.profile_type}, grade_level={self.grade_level})>"