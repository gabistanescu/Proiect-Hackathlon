from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import logging

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

logger = logging.getLogger(__name__)

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
    - Professors see all quizzes they created
    - Students see only quizzes available to them (no group or in their group)
    """
    query = db.query(Quiz)
    
    # If student, filter to only show available quizzes
    if current_user.role.value == "student":
        from src.models.student import Student
        student = db.query(Student).filter(Student.id == current_user.id).first()
        if student:
            # Student sees: quizzes with no group OR quizzes where they're in the group
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    Quiz.group_id.is_(None),  # Public quizzes (no group)
                    Quiz.group_id.in_([g.id for g in student.groups])  # Quizzes for their groups
                )
            )
    elif current_user.role.value == "professor":
        # Professors see only their own quizzes
        query = query.filter(Quiz.professor_id == current_user.id)
    
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
    - Professors can see only their own quizzes
    - Students can see quizzes available to them
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Authorization check
    if current_user.role.value == "professor":
        if quiz.professor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this quiz"
            )
    elif current_user.role.value == "student":
        # Check if student has access to this quiz
        if quiz.group_id:
            from src.models.student import Student
            student = db.query(Student).filter(Student.id == current_user.id).first()
            if not student or quiz.group_id not in [g.id for g in student.groups]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this quiz"
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
    
    # Check if student is allocated to this quiz
    if quiz.group_id:
        # Quiz is assigned to a specific group
        from src.models.student import Student
        student = db.query(Student).filter(Student.id == current_user.id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not a student"
            )
        
        # Check if student is in the group
        group = quiz.group
        if student not in group.students:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allocated to this quiz. Only students in the assigned group can take it."
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
    # Handle case where attempt hasn't been answered yet (e.g., just started)
    if not attempt.answers or attempt.completed_at is None:
        return {
            "attempt": attempt,
            "correct_answers": {},
            "student_answers": {},
            "question_scores": {}
        }
    
    student_answers = json.loads(attempt.answers)
    correct_answers = {}
    question_scores = {}
    ai_evaluations = {}  # Store AI evaluations by question_id
    
    # Get AI evaluation reports for this attempt
    from src.models.ai_evaluation_report import AIEvaluationReport
    ai_reports = db.query(AIEvaluationReport).filter(
        AIEvaluationReport.quiz_attempt_id == attempt.id
    ).all()
    
    for report in ai_reports:
        ai_evaluations[report.question_id] = {
            "ai_score": report.ai_score,
            "ai_feedback": report.ai_feedback,
            "ai_reasoning": report.ai_reasoning,
            "ai_model_version": report.ai_model_version,
            "ai_score_breakdown": json.loads(report.ai_score_breakdown) if report.ai_score_breakdown else {},
            "ai_strengths": json.loads(report.ai_strengths) if report.ai_strengths else [],
            "ai_improvements": json.loads(report.ai_improvements) if report.ai_improvements else [],
            "ai_suggestions": json.loads(report.ai_suggestions) if report.ai_suggestions else []
        }
    
    for question in quiz.questions:
        correct_answers[question.id] = json.loads(question.correct_answers)
        
        # Calculate score for this question
        student_ans = student_answers.get(str(question.id), [])
        if isinstance(student_ans, str):
            student_ans = [student_ans]
        
        # Score based on question type
        if question.question_type == QuestionType.FREE_TEXT:
            # Check if AI evaluation exists for this question
            ai_eval = ai_evaluations.get(question.id)
            if ai_eval:
                # Use AI score
                question_scores[question.id] = ai_eval["ai_score"]
            else:
                # Fallback to keyword matching if no AI evaluation
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
        "question_scores": question_scores,
        "ai_evaluations": ai_evaluations  # Include detailed AI feedback
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

# NEW ENDPOINTS FOR TIMER PERSISTENCE AND AUTO-SUBMISSION

@router.post("/start/{quiz_id}", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def start_quiz_attempt(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start a new quiz attempt or resume an existing one
    Returns the attempt with initial time_remaining set
    """
    if current_user.role.value != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can start quiz attempts"
        )
    
    from src.models.student import Student
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Check if student is allocated to this quiz
    if quiz.group_id:
        student = db.query(Student).filter(Student.id == current_user.id).first()
        if not student or quiz.group_id not in [g.id for g in student.groups]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allocated to this quiz"
            )
    
    # Check if there's an active attempt (not completed)
    existing_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.student_id == current_user.id,
        QuizAttempt.completed_at.is_(None)
    ).first()
    
    if existing_attempt:
        # Resume existing attempt - recalculate remaining time
        time_elapsed = (datetime.utcnow() - existing_attempt.started_at).total_seconds()
        total_time_seconds = quiz.time_limit * 60 if quiz.time_limit else 3600
        time_remaining = max(0, int(total_time_seconds - time_elapsed))
        
        existing_attempt.time_remaining = time_remaining
        if time_remaining <= 0:
            existing_attempt.is_expired = 1
        
        db.commit()
        db.refresh(existing_attempt)
        return existing_attempt
    
    # Create new attempt
    new_attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=current_user.id,
        started_at=datetime.utcnow(),
        time_remaining=(quiz.time_limit * 60) if quiz.time_limit else 3600,
        is_expired=0
    )
    
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    
    return new_attempt

@router.put("/{attempt_id}/timer-sync", response_model=QuizAttemptResponse)
def sync_timer(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync timer for an active attempt
    Recalculates time remaining based on server time
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    # Verify student owns this attempt
    if attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # If already completed or expired, return as is
    if attempt.completed_at or attempt.is_expired:
        return attempt
    
    # Recalculate time remaining
    quiz = attempt.quiz
    time_elapsed = (datetime.utcnow() - attempt.started_at).total_seconds()
    total_time_seconds = quiz.time_limit * 60 if quiz.time_limit else 3600
    time_remaining = max(0, int(total_time_seconds - time_elapsed))
    
    attempt.time_remaining = time_remaining
    if time_remaining <= 0:
        attempt.is_expired = 1
    
    db.commit()
    db.refresh(attempt)
    
    return attempt

@router.post("/{attempt_id}/auto-submit", response_model=QuizAttemptResponse, status_code=status.HTTP_200_OK)
def auto_submit_quiz_attempt(
    attempt_id: int,
    submit_data: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Auto-submit a quiz attempt when time expires or student submits
    Can optionally receive answers to save before submitting
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    # Verify student owns this attempt
    if attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if attempt.completed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt already submitted"
        )
    
    # If answers are provided in request, save them
    if submit_data and "answers" in submit_data and submit_data["answers"]:
        answers_dict = submit_data["answers"]
        # Convert keys to strings if needed
        if isinstance(answers_dict, dict):
            answers_dict = {str(k): v for k, v in answers_dict.items()}
        attempt.answers = json.dumps(answers_dict)
    
    # Mark as expired and completed
    attempt.is_expired = 1
    attempt.time_remaining = 0
    attempt.completed_at = datetime.utcnow()
    
    # If answers were provided, calculate score
    if attempt.answers:
        quiz = attempt.quiz
        total_score = 0.0
        max_score = 0.0
        
        try:
            answers_dict = json.loads(attempt.answers)
            
            for question in quiz.questions:
                max_score += question.points
                student_answers = answers_dict.get(str(question.id), [])
                if isinstance(student_answers, str):
                    student_answers = [student_answers]
                
                if question.question_type == QuestionType.SINGLE_CHOICE:
                    correct_answers = json.loads(question.correct_answers)
                    if student_answers and student_answers[0] in correct_answers:
                        total_score += question.points
                
                elif question.question_type == QuestionType.MULTIPLE_CHOICE:
                    correct_answers = json.loads(question.correct_answers)
                    if set(student_answers) == set(correct_answers):
                        total_score += question.points
                
                elif question.question_type == QuestionType.FREE_TEXT:
                    # For free text, use AI evaluation if available
                    from src.services.ai_evaluation_service import get_ai_evaluation_service
                    from src.models.ai_evaluation_report import AIEvaluationReport
                    ai_service = get_ai_evaluation_service()
                    
                    if student_answers:
                        student_text = student_answers if isinstance(student_answers, str) else student_answers[0]
                        criteria = question.evaluation_criteria or "Check if answer makes sense"
                        try:
                            ai_score, ai_feedback, metadata = ai_service.evaluate_free_text_answer(
                                question.question_text,
                                student_text,
                                criteria,
                                question.points,
                                "free_text"
                            )
                            total_score += ai_score
                            
                            # Save detailed AI evaluation report
                            ai_report = AIEvaluationReport(
                                quiz_attempt_id=attempt.id,
                                question_id=question.id,
                                student_id=attempt.student_id,
                                ai_score=ai_score,
                                ai_feedback=ai_feedback,
                                ai_reasoning=metadata.get("reasoning", ""),
                                ai_model_version=metadata.get("version", "gemini-2.5-flash-preview-05-20"),
                                ai_score_breakdown=json.dumps(metadata.get("score_breakdown", {})),
                                ai_strengths=json.dumps(metadata.get("strengths", [])),
                                ai_improvements=json.dumps(metadata.get("improvements", [])),
                                ai_suggestions=json.dumps(metadata.get("suggestions", [])),
                                reason="Auto-evaluated by AI system",
                                status="resolved"
                            )
                            db.add(ai_report)
                            
                        except Exception as e:
                            logger.error(f"AI evaluation failed: {e}, skipping score")
                            pass  # If AI fails, don't add points
            
            attempt.score = total_score
            attempt.max_score = max_score
        except (json.JSONDecodeError, KeyError, TypeError):
            pass
    
    db.commit()
    db.refresh(attempt)
    
    return attempt