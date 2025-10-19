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
            # Use gemini-2.5-flash (latest available, fast, and cost-effective)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
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
        """Build comprehensive evaluation prompt for AI with detailed feedback in Romanian"""
        
        prompt = f"""Ești un evaluator educațional expert specializat în evaluarea răspunsurilor studenților.

ÎNTREBARE:
{question_text}

RĂSPUNSUL STUDENTULUI:
{student_answer}

CRITERII DE EVALUARE / PUNCTE CHEIE:
{correct_criteria}

PUNCTAJ MAXIM: {int(max_score)} puncte

LINIILE DIRECTOARE DE EVALUARE:
1. **Corectitudine**: Răspunsul este factual corect?
2. **Completitudine**: Răspunsul abordează toate aspectele întrebării?
3. **Claritate**: Explicația este clară și bine structurată?
4. **Înțelegere**: Răspunsul demonstrează o înțelegere adevărată, nu doar memorare?
5. **Logică**: Logica este solidă și bine explicată?

SCALA DE PUNCTARE:
- Punctaj complet ({int(max_score)} pct): Răspuns cuprinzător, corect și care demonstrează înțelegere profundă
- 80% ({int(max_score * 0.8)} pct): Răspuns în mare parte corect cu mici lacune
- 60% ({int(max_score * 0.6)} pct): Răspuns care acoperă punctele principale dar le lipsește completitudinea sau claritatea
- 40% ({int(max_score * 0.4)} pct): Răspuns cu lacune semnificative dar care demonstrează o anumită înțelegere
- 20% ({int(max_score * 0.2)} pct): Înțelegere minimă, răspuns în mare parte incorect
- 0% (0 pct): Fără răspuns sau complet incorect

Furnizează evaluarea în următorul format JSON (TREBUIE SĂ FIE JSON VALID):
{{
    "score": <număr între 0 și {int(max_score)}>,
    "feedback": "<Feedback cuprinzător care abordează toate aspectele răspunsului>",
    "reasoning": "<Explicație scurtă a motivului pentru care acest punctaj a fost atribuit>",
    "score_breakdown": {{
        "correctness": <0-{int(max_score)}>,
        "completeness": <0-{int(max_score)}>,
        "clarity": <0-{int(max_score)}>
    }},
    "strengths": [
        "<Punct forte specific 1 - ce a făcut bine studentul>",
        "<Punct forte specific 2>",
        "<Punct forte specific 3 dacă e cazul>"
    ],
    "improvements": [
        "<Arie de îmbunătățire specifică 1>",
        "<Arie de îmbunătățire specifică 2>",
        "<Arie de îmbunătățire specifică 3 dacă e cazul>"
    ],
    "suggestions": [
        "<Sugestie acționabilă 1 pentru o mai bună înțelegere>",
        "<Sugestie acționabilă 2>",
        "<Sugestie acționabilă 3 dacă e cazul>"
    ]
}}

CERINȚE IMPORTANTE:
- Răspunde DOAR cu JSON valid, fără markdown, fără text explicativ
- Punctajul trebuie să fie un întreg sau zecimal între 0 și {int(max_score)}
- Feedback-ul trebuie să fie detaliat și profesional ÎN LIMBA ROMÂNĂ
- Punctele forte, îmbunătățirile și sugestiile trebuie să fie specifice și acționabile
- Toate array-urile trebuie să conțină cel puțin 2-3 elemente"""
        
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
