"""
AI Quiz Generation Service
Generates quizzes from material content using Google Gemini
"""

import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai
import os

logger = logging.getLogger(__name__)


class QuizGenerationService:
    """Service for generating quizzes from material using AI"""
    
    def __init__(self):
        """Initialize Gemini AI client"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set - Quiz generation disabled")
            self.enabled = False
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.enabled = True
    
    def generate_quiz_from_material(
        self,
        material_title: str,
        material_content: str,
        subject: str = "General Knowledge",
        grade_level: int = 10,
        num_questions: int = 3  # 1 single-choice, 1 multiple-choice, 1 free-text
    ) -> Dict[str, Any]:
        """
        Generate a quiz from material content
        Creates one question of each type: single_choice, multiple_choice, free_text
        
        Args:
            material_title: Title of the material
            material_content: Content/text from the material
            subject: Subject area
            grade_level: Grade level (9-12)
            num_questions: Number of questions per type (default 3 = 1 of each)
        
        Returns:
            Dictionary with quiz data including questions
        """
        if not self.enabled:
            raise Exception("AI service not configured. Set GEMINI_API_KEY.")
        
        if not material_content or len(material_content.strip()) < 50:
            raise Exception("Material content too short. Provide at least 50 characters.")
        
        try:
            prompt = self._build_generation_prompt(
                material_title,
                material_content,
                subject,
                grade_level
            )
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Parse JSON from response
            quiz_data = self._parse_quiz_response(response_text)
            
            return quiz_data
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {str(e)}")
            raise
    
    def _build_generation_prompt(
        self,
        material_title: str,
        material_content: str,
        subject: str,
        grade_level: int
    ) -> str:
        """Build prompt for AI to generate quiz questions"""
        
        prompt = f"""Generează un set de 3 întrebări pentru un test pe baza materialului dat.
        
TITLU MATERIAL: {material_title}
SUBIECT: {subject}
NIVEL: Clasa {grade_level}

CONȚINUT MATERIAL:
{material_content[:2000]}  # Limit to first 2000 chars to avoid token overflow

CERINȚE:
1. Generează EXACT 3 întrebări în formatul JSON de mai jos
2. ÎNTREBAREA 1: tip "single_choice" - o singură variantă corectă
3. ÎNTREBAREA 2: tip "multiple_choice" - mai multe variante corecte (2-3)
4. ÎNTREBAREA 3: tip "free_text" - răspuns liber, evaluare cu criterii

FORMATUL JSON (trebuie să fie VALID JSON):
{{
    "title": "Test {{subject}} - {{material_title}}",
    "description": "Test de antrenament bazat pe material",
    "subject": "{{subject}}",
    "grade_level": {{grade_level}},
    "questions": [
        {{
            "question_text": "<text întrebare 1 - single choice>",
            "question_type": "single_choice",
            "options": ["opțiune1", "opțiune2", "opțiune3", "opțiune4"],
            "correct_answers": ["opțiune corectă"],
            "points": 1.0
        }},
        {{
            "question_text": "<text întrebare 2 - multiple choice>",
            "question_type": "multiple_choice",
            "options": ["opțiune1", "opțiune2", "opțiune3", "opțiune4"],
            "correct_answers": ["opțiune corectă 1", "opțiune corectă 2"],
            "points": 2.0
        }},
        {{
            "question_text": "<text întrebare 3 - liber>",
            "question_type": "free_text",
            "options": null,
            "correct_answers": ["cuvânt cheie 1", "cuvânt cheie 2"],
            "evaluation_criteria": "Răspunsul trebuie să conțină: ...",
            "points": 2.0
        }}
    ]
}}

INSTRUCȚIUNI IMPORTANTE:
- Toate întrebările trebuie să fie în LIMBA ROMÂNĂ
- Întrebările trebuie să fie relevante cu materialul
- Nivel de dificultate potrivit clasei {grade_level}
- Pentru free_text, evaluation_criteria trebuie să conțină punctele cheie de evaluat
- Răspunsurile corecte trebuie să fie clare și neambigue
- Returnează DOAR JSON-ul, fără alt text"""
        
        return prompt
    
    def _parse_quiz_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response and extract quiz data"""
        
        try:
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end <= json_start:
                raise ValueError("No JSON found in AI response")
            
            json_str = response_text[json_start:json_end]
            quiz_data = json.loads(json_str)
            
            # Validate structure
            if "questions" not in quiz_data:
                raise ValueError("Missing 'questions' in quiz data")
            
            if len(quiz_data["questions"]) < 3:
                raise ValueError("Expected at least 3 questions")
            
            # Ensure JSON fields are properly formatted
            for question in quiz_data["questions"]:
                # Ensure options is list or null
                if question.get("options") and not isinstance(question["options"], list):
                    question["options"] = [str(question["options"])]
                
                # Ensure correct_answers is list
                if not isinstance(question.get("correct_answers"), list):
                    question["correct_answers"] = [str(question.get("correct_answers", ""))]
                
                # Set points if missing
                if "points" not in question:
                    question["points"] = 1.0
            
            return quiz_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quiz JSON: {str(e)}")
            raise ValueError(f"Invalid JSON in AI response: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to parse quiz response: {str(e)}")
            raise


# Global instance
_quiz_gen_service: Optional[QuizGenerationService] = None


def get_quiz_generation_service() -> QuizGenerationService:
    """Get or create quiz generation service instance"""
    global _quiz_gen_service
    if _quiz_gen_service is None:
        _quiz_gen_service = QuizGenerationService()
    return _quiz_gen_service
