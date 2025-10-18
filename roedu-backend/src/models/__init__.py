"""
Models package - Contains all database models
"""
from src.models.user import User, UserRole
from src.models.administrator import Administrator
from src.models.professor import Professor
from src.models.student import Student, ProfileType
from src.models.material import Material, VisibilityType
from src.models.material_suggestions import (
    MaterialSuggestion, 
    SuggestionComment, 
    MaterialFeedbackProfessor, 
    MaterialFeedbackStudent,
    SuggestionStatus
)
from src.models.quiz import Quiz, Question, QuizAttempt, QuestionType
from src.models.comment import Comment, CommentType, CommentStatus
from src.models.group import Group
from src.models.ai_evaluation_report import AIEvaluationReport, EvaluationStatus

__all__ = [
    "User",
    "UserRole",
    "Administrator",
    "Professor",
    "Student",
    "ProfileType",
    "Material",
    "VisibilityType",
    "MaterialSuggestion",
    "SuggestionComment",
    "MaterialFeedbackProfessor",
    "MaterialFeedbackStudent",
    "SuggestionStatus",
    "Quiz",
    "Question",
    "QuizAttempt",
    "QuestionType",
    "Comment",
    "CommentType",
    "CommentStatus",
    "Group",
    "AIEvaluationReport",
    "EvaluationStatus",
]