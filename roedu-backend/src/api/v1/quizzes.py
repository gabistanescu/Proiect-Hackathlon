from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from src.config.database import get_db
from src.services.auth_service import get_current_user
from src.models.user import User
from src.models.quiz import Quiz, Question, QuizAttempt, QuestionType
from src.models.professor import Professor
from src.schemas.quiz_schema import (
    QuizCreate, QuizUpdate, QuizResponse,
    QuestionCreate, QuestionResponse,
    QuizAttemptCreate, QuizAttemptResponse, QuizResultResponse,
    QuizCopyRequest, AIQuizGenerateRequest
)

router = APIRouter()

def score_free_text_answer(student_answer: str, evaluation_criteria: str, correct_answers: List[str]) -> tuple[float, bool]:
    """
    Score a free text answer based on keyword matching or exact match.
    Returns (score: 0 or 1, is_correct: bool)
    """
    if not student_answer or not student_answer.strip():
        return (0.0, False)
    
    student_answer_lower = student_answer.lower().strip()
    
    # First try exact match with any correct answer
    for correct in correct_answers:
        if student_answer_lower == correct.lower():
            return (1.0, True)
    
    # If evaluation_criteria provided, check for keyword matching
    if evaluation_criteria:
        try:
            criteria = json.loads(evaluation_criteria)
            if isinstance(criteria, list):
                # Check if any keywords are present
                keywords = [kw.lower() for kw in criteria]
                for keyword in keywords:
                    if keyword in student_answer_lower:
                        return (0.5, False)  # Partial credit for keyword match
        except json.JSONDecodeError:
            pass
    
    return (0.0, False)

@router.get("/", response_model=List[QuizResponse])
def list_quizzes(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    grade_level: Optional[int] = Query(None, ge=9, le=12, description="Filter by grade level"),
    professor_id: Optional[int] = Query(None, description="Filter by professor"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List quizzes with optional filters
    """
    query = db.query(Quiz)
    
    if subject:
        query = query.filter(Quiz.subject.contains(subject))
    
    if grade_level:
        query = query.filter(Quiz.grade_level == grade_level)
    
    if professor_id:
        query = query.filter(Quiz.professor_id == professor_id)
    
    quizzes = query.offset(skip).limit(limit).all()
    return quizzes

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get quiz details with all questions
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    return quiz

@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(
    quiz_data: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new quiz (professors only)
    """
    if current_user.role.value != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can create quizzes"
        )
    
    # Verify professor exists
    professor = db.query(Professor).filter(Professor.id == current_user.id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor profile not found"
        )
    
    # Create quiz
    quiz_dict = quiz_data.model_dump(exclude={'questions'})
    new_quiz = Quiz(
        **quiz_dict,
        professor_id=current_user.id
    )
    
    db.add(new_quiz)
    db.flush()  # Get quiz ID
    
    # Add questions
    for idx, question_data in enumerate(quiz_data.questions):
        question_dict = question_data.model_dump()
        options = question_dict.pop('options', None)
        correct_answers = question_dict.pop('correct_answers', [])
        
        question = Question(
            **question_dict,
            quiz_id=new_quiz.id,
            order_index=idx,
            options=json.dumps(options) if options else None,
            correct_answers=json.dumps(correct_answers)
        )
        db.add(question)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a quiz (owner or admin only)
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Check permissions
    if quiz.professor_id != current_user.id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this quiz"
        )
    
    # Update fields
    update_data = quiz_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(quiz, field, value)
    
    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a quiz (owner or admin only)
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Check permissions
    if quiz.professor_id != current_user.id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this quiz"
        )
    
    db.delete(quiz)
    db.commit()
    return None

@router.post("/{quiz_id}/copy", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def copy_quiz(
    quiz_id: int,
    copy_request: QuizCopyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a copy of an existing quiz (professors only)
    """
    if current_user.role.value != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can copy quizzes"
        )
    
    original_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not original_quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Create new quiz
    new_title = copy_request.new_title or f"Copy of {original_quiz.title}"
    new_quiz = Quiz(
        title=new_title,
        description=original_quiz.description,
        subject=original_quiz.subject,
        grade_level=original_quiz.grade_level,
        profile_type=original_quiz.profile_type,
        time_limit=original_quiz.time_limit,
        is_ai_generated=original_quiz.is_ai_generated,
        professor_id=current_user.id,
        group_id=copy_request.group_id
    )
    
    db.add(new_quiz)
    db.flush()
    
    # Copy questions
    for original_question in original_quiz.questions:
        new_question = Question(
            quiz_id=new_quiz.id,
            question_text=original_question.question_text,
            question_type=original_question.question_type,
            options=original_question.options,
            correct_answers=original_question.correct_answers,
            evaluation_criteria=original_question.evaluation_criteria,
            points=original_question.points,
            order_index=original_question.order_index
        )
        db.add(new_question)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.post("/{quiz_id}/attempt", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz_attempt(
    quiz_id: int,
    attempt_data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a quiz attempt (students only)
    Handles both grila (multiple/single choice) and libre (free text) questions
    """
    if current_user.role.value != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit quiz attempts"
        )
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Calculate score
    total_score = 0.0
    max_score = 0.0
    
    for question in quiz.questions:
        max_score += question.points
        
        # Get student's answers for this question
        student_answers = attempt_data.answers.get(str(question.id), [])
        if isinstance(student_answers, str):
            student_answers = [student_answers]
        
        correct_answers = json.loads(question.correct_answers)
        
        # Score based on question type
        if question.question_type == QuestionType.FREE_TEXT:
            # For free text, use keyword matching
            student_text = student_answers[0] if student_answers else ""
            score, _ = score_free_text_answer(
                student_text,
                question.evaluation_criteria or "",
                correct_answers
            )
            total_score += score * question.points
        else:
            # For grila (SINGLE_CHOICE, MULTIPLE_CHOICE), exact match
            if set(student_answers) == set(correct_answers):
                total_score += question.points
    
    # Create attempt
    new_attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=current_user.id,
        answers=json.dumps({str(k): v for k, v in attempt_data.answers.items()}),
        score=total_score,
        max_score=max_score,
        completed_at=datetime.utcnow()
    )
    
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    return new_attempt

@router.get("/{quiz_id}/attempts", response_model=List[QuizAttemptResponse])
def get_quiz_attempts(
    quiz_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all attempts for a quiz (quiz owner or admin only)
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Check permissions
    if quiz.professor_id != current_user.id and current_user.role.value != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view quiz attempts"
        )
    
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id
    ).offset(skip).limit(limit).all()
    
    return attempts

@router.get("/attempts/{attempt_id}", response_model=QuizResultResponse)
def get_quiz_result(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed results for a quiz attempt
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found"
        )
    
    # Check permissions
    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    if (attempt.student_id != current_user.id and 
        quiz.professor_id != current_user.id and 
        current_user.role.value != "administrator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this attempt"
        )
    
    # Build result
    student_answers = json.loads(attempt.answers)
    correct_answers = {}
    question_scores = {}
    
    for question in quiz.questions:
        correct_answers[question.id] = json.loads(question.correct_answers)
        
        # Calculate score for this question
        student_ans = student_answers.get(str(question.id), [])
        if isinstance(student_ans, str):
            student_ans = [student_ans]
        
        # Score based on question type
        if question.question_type == QuestionType.FREE_TEXT:
            student_text = student_ans[0] if student_ans else ""
            score, _ = score_free_text_answer(
                student_text,
                question.evaluation_criteria or "",
                correct_answers[question.id]
            )
            question_scores[question.id] = score * question.points
        else:
            # Grila scoring
            if set(student_ans) == set(correct_answers[question.id]):
                question_scores[question.id] = question.points
            else:
                question_scores[question.id] = 0.0
    
    return {
        "attempt": attempt,
        "correct_answers": correct_answers,
        "student_answers": {int(k) if k.isdigit() else k: v for k, v in student_answers.items()},
        "question_scores": question_scores
    }

@router.post("/generate-ai", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def generate_ai_quiz(
    request: AIQuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a quiz using AI (professors only)
    """
    if current_user.role.value != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can generate AI quizzes"
        )
    
    # Import AI service
    from src.services.quiz_service import generate_quiz_with_ai
    
    try:
        quiz = generate_quiz_with_ai(request, current_user.id, db)
        return quiz
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )