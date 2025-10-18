from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime
import enum

class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    FREE_TEXT = "free_text"

class Quiz(Base):
    __tablename__ = 'quizzes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100))
    grade_level = Column(Integer)
    profile_type = Column(String(50))
    time_limit = Column(Integer)  # in minutes
    is_ai_generated = Column(Integer, default=0)  # Using Integer for SQLite
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=False)
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    professor = relationship("Professor", back_populates="quizzes")
    group = relationship("Group", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quiz(id={self.id}, title={self.title})>"

class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    options = Column(Text, nullable=True)  # JSON string of answer options (for grila only)
    correct_answers = Column(Text, nullable=False)  # JSON string for correct answers
    points = Column(Float, default=1.0)
    order_index = Column(Integer)
    # For FREE_TEXT: evaluation criteria/keywords or examples
    evaluation_criteria = Column(Text, nullable=True)

    # Relationship
    quiz = relationship("Quiz", back_populates="questions")

    def __repr__(self):
        return f"<Question(id={self.id}, question_text={self.question_text[:50]})>"

class QuizAttempt(Base):
    __tablename__ = 'quiz_attempts'

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    answers = Column(Text)  # JSON string of student's answers
    score = Column(Float)
    max_score = Column(Float)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("Student", back_populates="quiz_attempts")

    def __repr__(self):
        return f"<QuizAttempt(id={self.id}, student_id={self.student_id}, score={self.score})>"