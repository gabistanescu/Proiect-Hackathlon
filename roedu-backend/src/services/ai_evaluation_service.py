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
            # Use gemini-1.5-flash (latest available model, faster and cheaper than pro)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
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
        """Build comprehensive evaluation prompt for AI with detailed feedback structure"""
        
        prompt = f"""You are an expert educational evaluator specialized in assessing student answers.

QUESTION:
{question_text}

STUDENT'S ANSWER:
{student_answer}

EVALUATION CRITERIA / KEY POINTS:
{correct_criteria}

MAXIMUM SCORE: {int(max_score)} points

EVALUATION GUIDELINES:
1. **Correctness**: Is the answer factually correct?
2. **Completeness**: Does the answer address all aspects of the question?
3. **Clarity**: Is the explanation clear and well-structured?
4. **Understanding**: Does the answer demonstrate true understanding, not just memorization?
5. **Reasoning**: Is the logic sound and well-explained?

SCORING RUBRIC:
- Full Score ({int(max_score)} pts): Answer is comprehensive, correct, and shows deep understanding
- 80% ({int(max_score * 0.8)} pts): Answer is mostly correct with minor gaps
- 60% ({int(max_score * 0.6)} pts): Answer covers main points but lacks completeness or clarity
- 40% ({int(max_score * 0.4)} pts): Answer has significant gaps but shows some understanding
- 20% ({int(max_score * 0.2)} pts): Minimal understanding, mostly incorrect
- 0% (0 pts): No answer or completely incorrect

Provide your evaluation in the following JSON format (MUST BE VALID JSON):
{{
    "score": <number between 0 and {int(max_score)}>,
    "feedback": "<Comprehensive feedback that addresses all aspects of the answer>",
    "reasoning": "<Brief explanation of why this score was assigned>",
    "score_breakdown": {{
        "correctness": <0-{int(max_score)}>,
        "completeness": <0-{int(max_score)}>,
        "clarity": <0-{int(max_score)}>
    }},
    "strengths": [
        "<Specific strength 1 - what the student did well>",
        "<Specific strength 2>",
        "<Specific strength 3 if applicable>"
    ],
    "improvements": [
        "<Specific area for improvement 1>",
        "<Specific area for improvement 2>",
        "<Specific area for improvement 3 if applicable>"
    ],
    "suggestions": [
        "<Actionable suggestion 1 for better understanding>",
        "<Actionable suggestion 2>",
        "<Actionable suggestion 3 if applicable>"
    ]
}}

IMPORTANT REQUIREMENTS:
- Return ONLY valid JSON, no markdown, no explanatory text
- Score must be an integer or float between 0 and {int(max_score)}
- Feedback should be detailed and professional
- Strengths, improvements, and suggestions should be specific and actionable
- All arrays must contain at least 2-3 items

Example response format (replace with actual evaluation):
{{
    "score": {int(max_score * 0.75)},
    "feedback": "Your answer demonstrates good understanding of the core concepts and provides clear examples. You correctly identified the main points and explained them well. However, you could have included more specific supporting details to make the answer more comprehensive.",
    "reasoning": "Full marks were not awarded because while the answer is mostly correct and clear, it lacks some of the depth and supporting details expected for a complete response.",
    "score_breakdown": {{
        "correctness": {int(max_score * 0.9)},
        "completeness": {int(max_score * 0.7)},
        "clarity": {int(max_score * 0.8)}
    }},
    "strengths": [
        "Clear and logical presentation of ideas",
        "Correct understanding of fundamental concepts",
        "Good use of examples to support explanations"
    ],
    "improvements": [
        "Could include more supporting evidence or references",
        "Some concepts could be explained in greater depth",
        "Could benefit from more detailed analysis"
    ],
    "suggestions": [
        "Try to provide specific examples for each main point",
        "Consider exploring the topic from multiple perspectives",
        "Review related concepts to deepen your understanding"
    ]
}}"""
        
        return prompt
    
    def _parse_ai_response(
        self,
        response_text: str,
        max_score: float,
        question_type: str
    ) -> Tuple[float, str, Dict[str, Any]]:
        """Parse AI response and extract score, feedback, and detailed breakdown"""
        
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
            
            # Extract detailed feedback components
            score_breakdown = data.get("score_breakdown", {})
            strengths = data.get("strengths", [])
            improvements = data.get("improvements", [])
            suggestions = data.get("suggestions", [])
            reasoning = data.get("reasoning", "")
            
            metadata = {
                "version": "v2-detailed-feedback",
                "question_type": question_type,
                "max_score": max_score,
                "reasoning": reasoning,
                "score_breakdown": score_breakdown,
                "strengths": strengths,
                "improvements": improvements,
                "suggestions": suggestions,
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
