from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime
import enum

class EvaluationStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class AIEvaluationReport(Base):
    __tablename__ = 'ai_evaluation_reports'

    id = Column(Integer, primary_key=True, index=True)
    quiz_attempt_id = Column(Integer, ForeignKey('quiz_attempts.id'), nullable=False)
    question_id = Column(Integer, ForeignKey('questions.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    
    # AI Evaluation Details
    ai_score = Column(Float, nullable=False)  # Original AI score (0-100%)
    ai_feedback = Column(Text, nullable=True)  # AI feedback text
    ai_reasoning = Column(Text, nullable=True)  # Detailed AI reasoning
    ai_model_version = Column(String(100), nullable=True)  # e.g., "gemini-pro"
    
    # Student Report (Dispute)
    reason = Column(Text, nullable=False)  # Why student disputes the evaluation
    status = Column(Enum(EvaluationStatus), default=EvaluationStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Professor Review
    professor_id = Column(Integer, ForeignKey('professors.id'), nullable=True)
    professor_feedback = Column(Text, nullable=True)  # Professor's review feedback
    new_score = Column(Float, nullable=True)  # Professor's corrected score (0-100%)
    reviewed_at = Column(DateTime, nullable=True)  # When professor reviewed it
    
    # Relationships
    quiz_attempt = relationship("QuizAttempt", back_populates="evaluation_reports")
    question = relationship("Question")
    student = relationship("Student")
    professor = relationship("Professor")
    
    def __repr__(self):
        return f"<AIEvaluationReport(id={self.id}, attempt_id={self.quiz_attempt_id}, status={self.status})>"
