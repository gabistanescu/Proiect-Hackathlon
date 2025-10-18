"""
AI Evaluation Service using Google Gemini API
Implements specialized evaluation for free text answers
Similar to AssesmentLearningPlatform's AI evaluation system
"""

import os
import json
import logging
from typing import Dict, Any, Optional, Tuple
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIEvaluationService:
    """Service for evaluating free text answers using AI"""
    
    def __init__(self):
        """Initialize Gemini AI client"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set - AI evaluation will use fallback keyword matching")
            self.enabled = False
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.enabled = True
    
    def evaluate_free_text_answer(
        self,
        question_text: str,
        student_answer: str,
        correct_criteria: str,
        max_score: float = 100.0,
        question_type: str = "free_text"
    ) -> Tuple[float, str, Dict[str, Any]]:
        """
        Evaluate a free text answer using AI
        
        Args:
            question_text: The quiz question
            student_answer: Student's answer text
            correct_criteria: Evaluation criteria/keywords
            max_score: Maximum points for this question
            question_type: Type of question
        
        Returns:
            Tuple of (score, feedback, metadata_dict)
        """
        
        if not self.enabled:
            logger.info("AI evaluation disabled, using keyword matching")
            return self._evaluate_with_keywords(
                student_answer, 
                correct_criteria, 
                max_score
            )
        
        try:
            prompt = self._build_evaluation_prompt(
                question_text,
                student_answer,
                correct_criteria,
                max_score,
                question_type
            )
            
            # Call Gemini API
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Parse AI response
            score, feedback, metadata = self._parse_ai_response(
                response_text,
                max_score,
                question_type
            )
            
            return score, feedback, metadata
            
        except Exception as e:
            logger.error(f"AI evaluation failed: {str(e)}, falling back to keyword matching")
            return self._evaluate_with_keywords(
                student_answer,
                correct_criteria,
                max_score
            )
    
    def _build_evaluation_prompt(
        self,
        question_text: str,
        student_answer: str,
        correct_criteria: str,
        max_score: float,
        question_type: str
    ) -> str:
        """Build evaluation prompt for AI"""
        
        prompt = f"""You are an expert educational evaluator. 

Evaluate the following student's answer to a quiz question.

QUESTION:
{question_text}

STUDENT'S ANSWER:
{student_answer}

EVALUATION CRITERIA / EXPECTED POINTS:
{correct_criteria}

Max Score: {max_score} points

Provide your evaluation in the following JSON format:
{{
    "score": <number between 0 and {max_score}>,
    "feedback": "<detailed feedback for the student>",
    "reasoning": "<brief explanation of the score>",
    "strengths": ["<positive aspect 1>", "<positive aspect 2>"],
    "improvements": ["<area for improvement 1>", "<area for improvement 2>"]
}}

Be fair but rigorous. Consider:
1. Correctness of the answer
2. Completeness of explanation
3. Understanding of the concept
4. Quality of reasoning

Return ONLY valid JSON, no additional text."""
        
        return prompt
    
    def _parse_ai_response(
        self,
        response_text: str,
        max_score: float,
        question_type: str
    ) -> Tuple[float, str, Dict[str, Any]]:
        """Parse AI response and extract score and feedback"""
        
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end <= json_start:
                logger.warning("Could not find JSON in AI response")
                raise ValueError("No JSON found in response")
            
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)
            
            # Validate and normalize score
            score = float(data.get("score", 0))
            score = max(0, min(score, max_score))  # Clamp between 0 and max_score
            
            feedback = data.get("feedback", "No feedback available")
            
            metadata = {
                "version": "v1-ai-evaluation",
                "question_type": question_type,
                "max_score": max_score,
                "reasoning": data.get("reasoning", ""),
                "strengths": data.get("strengths", []),
                "improvements": data.get("improvements", []),
                "ai_generated": True
            }
            
            return score, feedback, metadata
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"Failed to parse AI response: {str(e)}")
            # Fallback: return middle score with generic feedback
            score = max_score * 0.5
            feedback = "Could not properly evaluate your answer. Please review with your instructor."
            metadata = {
                "version": "v1-fallback",
                "question_type": question_type,
                "max_score": max_score,
                "error": str(e),
                "ai_generated": False
            }
            return score, feedback, metadata
    
    def _evaluate_with_keywords(
        self,
        student_answer: str,
        correct_criteria: str,
        max_score: float
    ) -> Tuple[float, str, Dict[str, Any]]:
        """
        Fallback evaluation using keyword matching
        (keyword matching logic from original implementation)
        """
        
        if not student_answer or not student_answer.strip():
            return 0.0, "No answer provided.", {"method": "keyword_matching"}
        
        student_answer_lower = student_answer.lower().strip()
        
        # Parse keywords from criteria
        keywords = [kw.strip().lower() for kw in correct_criteria.split(',')]
        keywords = [kw for kw in keywords if kw]  # Remove empty strings
        
        if not keywords:
            return 0.0, "Invalid evaluation criteria.", {"method": "keyword_matching"}
        
        # Count keyword matches
        matches = sum(1 for kw in keywords if kw in student_answer_lower)
        match_ratio = matches / len(keywords)
        
        # Calculate score
        if match_ratio >= 0.8:
            # 80%+ keywords: full score
            score = max_score
            feedback = "Excellent answer! All key points covered."
        elif match_ratio >= 0.5:
            # 50-79% keywords: partial credit (60% of max)
            score = max_score * 0.6
            feedback = "Good answer. You covered most key points but could be more complete."
        else:
            # Less than 50% keywords: low score (20% of max)
            score = max_score * 0.2
            feedback = "Incomplete answer. Many key points are missing."
        
        metadata = {
            "method": "keyword_matching",
            "keywords_provided": len(keywords),
            "keywords_matched": matches,
            "match_ratio": match_ratio
        }
        
        return score, feedback, metadata


# Global instance
_ai_service: Optional[AIEvaluationService] = None


def get_ai_evaluation_service() -> AIEvaluationService:
    """Get or create AI evaluation service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIEvaluationService()
    return _ai_service


def evaluate_answer(
    question_text: str,
    student_answer: str,
    correct_criteria: str,
    max_score: float = 100.0
) -> Tuple[float, str]:
    """
    Convenience function to evaluate an answer
    
    Returns:
        Tuple of (score, feedback)
    """
    service = get_ai_evaluation_service()
    score, feedback, _ = service.evaluate_free_text_answer(
        question_text,
        student_answer,
        correct_criteria,
        max_score
    )
    return score, feedback
