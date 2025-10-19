from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from src.config.database import get_db
from src.models.ai_evaluation_report import AIEvaluationReport, EvaluationStatus
from src.models.quiz import QuizAttempt, Question
from src.models.user import User
from src.schemas.ai_evaluation_schema import (
    AIEvaluationReportCreate,
    AIEvaluationReportResponse,
    ReviewReportRequest
)
from src.services.auth_service import get_current_user

router = APIRouter(tags=["ai_evaluation_reports"])

@router.post("/attempts/{attempt_id}/questions/{question_id}/report", response_model=AIEvaluationReportResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation_report(
    attempt_id: int,
    question_id: int,
    report_data: AIEvaluationReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Student creates a report disputing AI evaluation for a free text question
    """
    # Verify attempt exists and belongs to current user
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    if attempt.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only report your own attempts"
        )
    
    # Verify question exists in this quiz
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.quiz_id == attempt.quiz_id
    ).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found in this quiz"
        )
    
    # Check if already reported
    existing = db.query(AIEvaluationReport).filter(
        AIEvaluationReport.quiz_attempt_id == attempt_id,
        AIEvaluationReport.question_id == question_id
    ).first()
    
    # Get the AI evaluation for this question (there should be one)
    ai_report = existing
    if not ai_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI evaluation found for this question. Cannot report on non-evaluated question."
        )
    
    # If the report already has a dispute reason, user wants to update it
    # So update existing report instead of creating new one
    if ai_report.reason and ai_report.reason != "Auto-evaluated by AI system":
        # Already has a report from student
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already reported this evaluation. Contact your professor if you need to change it."
        )
    
    # Update the existing report with student's dispute reason
    ai_report.reason = report_data.reason
    ai_report.status = EvaluationStatus.PENDING
    
    db.commit()
    db.refresh(ai_report)
    return ai_report

@router.get("/reports", response_model=List[AIEvaluationReportResponse])
def get_pending_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Professor gets pending evaluation reports to review
    """
    # Check if professor
    from src.models.professor import Professor
    prof = db.query(Professor).filter(Professor.id == current_user.id).first()
    if not prof:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can view reports"
        )
    
    # Get pending reports for quizzes this professor created
    reports = db.query(AIEvaluationReport).join(
        QuizAttempt, AIEvaluationReport.quiz_attempt_id == QuizAttempt.id
    ).join(
        Question, AIEvaluationReport.question_id == Question.id
    ).filter(
        AIEvaluationReport.status == EvaluationStatus.PENDING
    ).offset(skip).limit(limit).all()
    
    return reports

@router.put("/reports/{report_id}/review", response_model=AIEvaluationReportResponse)
def review_evaluation_report(
    report_id: int,
    review_data: ReviewReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Professor reviews and potentially corrects AI evaluation
    """
    from src.models.professor import Professor
    prof = db.query(Professor).filter(Professor.id == current_user.id).first()
    if not prof:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professors can review reports"
        )
    
    # Get report
    report = db.query(AIEvaluationReport).filter(AIEvaluationReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update with professor review
    report.status = review_data.status
    report.professor_id = current_user.id
    report.professor_feedback = review_data.professor_feedback
    report.new_score = review_data.new_score
    report.reviewed_at = datetime.utcnow()
    
    # If professor assigned new score, update attempt score if all questions reviewed
    if review_data.new_score is not None:
        attempt = report.quiz_attempt
        # TODO: Recalculate attempt total score based on professor corrections
        pass
    
    db.commit()
    db.refresh(report)
    return report

@router.get("/reports/{report_id}", response_model=AIEvaluationReportResponse)
def get_evaluation_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed report for student or professor
    """
    report = db.query(AIEvaluationReport).filter(AIEvaluationReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Check authorization - student can see own, professor can see for their quizzes
    from src.models.professor import Professor
    attempt = report.quiz_attempt
    
    if report.student_id != current_user.id:
        prof = db.query(Professor).filter(Professor.id == current_user.id).first()
        if not prof:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this report"
            )
        # Verify prof owns the quiz
        if attempt.quiz.professor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this report"
            )
    
    return report

@router.get("/student/reports", response_model=List[AIEvaluationReportResponse])
def get_student_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Student gets their own evaluation reports
    """
    reports = db.query(AIEvaluationReport).filter(
        AIEvaluationReport.student_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return reports
