from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class QuestionType(str, Enum):
    SINGLE_CHOICE = "single"
    MULTIPLE_CHOICE = "multiple"
    TRUE_FALSE = "true_false"

class ProfileType(str, Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: List[str]
    correct_answers: List[str]  # Can be multiple for MULTIPLE_CHOICE
    points: float = 1.0
    order_index: Optional[int] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answers: Optional[List[str]] = None
    points: Optional[float] = None
    order_index: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    
    model_config = ConfigDict(from_attributes=True)

# Quiz Schemas
class QuizBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    profile_type: Optional[str] = None
    time_limit: Optional[int] = None
    group_id: Optional[int] = None

class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []
    is_ai_generated: bool = False

class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    profile_type: Optional[str] = None
    time_limit: Optional[int] = None
    group_id: Optional[int] = None

class QuizResponse(QuizBase):
    id: int
    professor_id: int
    is_ai_generated: bool
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class QuizCopyRequest(BaseModel):
    new_title: Optional[str] = None
    group_id: Optional[int] = None

# Quiz Attempt Schemas
class QuizAttemptCreate(BaseModel):
    quiz_id: int
    answers: Dict[int, List[str]]  # question_id -> selected answers

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    score: float
    max_score: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class QuizResultResponse(BaseModel):
    attempt: QuizAttemptResponse
    correct_answers: Dict[int, List[str]]
    student_answers: Dict[int, List[str]]
    question_scores: Dict[int, float]

# AI Quiz Generation
class AIQuizGenerateRequest(BaseModel):
    topic: str
    subject: str
    grade_level: int = Field(..., ge=9, le=12)
    profile_type: Optional[ProfileType] = None
    num_questions: int = Field(default=10, ge=1, le=50)
    question_types: Optional[List[QuestionType]] = None