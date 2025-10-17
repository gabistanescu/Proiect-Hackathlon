from typing import List, Dict, Any, Optional
import json
from src.config.settings import settings
from src.schemas.quiz_schema import AIQuizGenerateRequest, QuestionCreate, QuestionType

class AIService:
    """
    Service for AI-powered features like quiz generation and material search
    """
    
    def __init__(self):
        self.ai_enabled = settings.AI_ENABLED
        if self.ai_enabled and settings.OPENAI_API_KEY:
            try:
                import openai
                self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            except ImportError:
                self.ai_enabled = False
                self.client = None
        else:
            self.client = None
    
    async def generate_quiz(self, request: AIQuizGenerateRequest) -> List[QuestionCreate]:
        """
        Generate quiz questions using AI based on topic and parameters
        """
        if not self.ai_enabled or not self.client:
            # Return mock questions if AI is not enabled
            return self._generate_mock_questions(request)
        
        try:
            # Build prompt for OpenAI
            prompt = self._build_quiz_prompt(request)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an educational quiz generator. Generate quiz questions in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse response
            content = response.choices[0].message.content
            questions_data = json.loads(content)
            
            # Convert to QuestionCreate objects
            questions = []
            for i, q_data in enumerate(questions_data.get("questions", [])):
                question = QuestionCreate(
                    question_text=q_data["question"],
                    question_type=QuestionType(q_data.get("type", "single")),
                    options=q_data["options"],
                    correct_answers=q_data["correct_answers"] if isinstance(q_data["correct_answers"], list) else [q_data["correct_answers"]],
                    points=1.0,
                    order_index=i
                )
                questions.append(question)
            
            return questions
        
        except Exception as e:
            print(f"AI Quiz Generation Error: {e}")
            # Fallback to mock questions
            return self._generate_mock_questions(request)
    
    def _build_quiz_prompt(self, request: AIQuizGenerateRequest) -> str:
        """Build prompt for quiz generation"""
        question_types_str = ", ".join([qt.value for qt in request.question_types]) if request.question_types else "single choice"
        
        prompt = f"""Generate {request.num_questions} quiz questions about {request.topic} for {request.subject} class.
Grade level: {request.grade_level} (Romanian high school)
Profile type: {request.profile_type.value if request.profile_type else 'general'}
Question types: {question_types_str}

Return ONLY a JSON object in this exact format:
{{
    "questions": [
        {{
            "question": "Question text here?",
            "type": "single",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answers": ["Option A"]
        }}
    ]
}}

Make questions appropriate for the grade level and profile type. For multiple choice questions, correct_answers should be an array with multiple items."""
        
        return prompt
    
    def _generate_mock_questions(self, request: AIQuizGenerateRequest) -> List[QuestionCreate]:
        """Generate mock questions when AI is not available"""
        questions = []
        for i in range(min(request.num_questions, 5)):
            question = QuestionCreate(
                question_text=f"Întrebare exemplu {i+1} despre {request.topic} pentru {request.subject}?",
                question_type=QuestionType.SINGLE_CHOICE,
                options=[
                    f"Răspuns A pentru întrebarea {i+1}",
                    f"Răspuns B pentru întrebarea {i+1}",
                    f"Răspuns C pentru întrebarea {i+1}",
                    f"Răspuns D pentru întrebarea {i+1}"
                ],
                correct_answers=[f"Răspuns A pentru întrebarea {i+1}"],
                points=1.0,
                order_index=i
            )
            questions.append(question)
        
        return questions
    
    async def search_materials_semantic(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Perform semantic search on materials using AI
        Returns list of material IDs with relevance scores
        """
        # This would use vector embeddings in a production system
        # For now, return empty list (will fall back to regular search)
        return []
    
    async def answer_question(self, question: str, context: str = "") -> str:
        """
        Answer student questions using AI based on material context
        """
        if not self.ai_enabled or not self.client:
            return "AI service nu este disponibil momentan. Vă rugăm contactați profesorul pentru asistență."
        
        try:
            prompt = f"Context: {context}\n\nÎntrebare: {question}\n\nRăspunde în limba română, clar și educațional:"
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful educational assistant for Romanian high school students. Answer in Romanian."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"AI Answer Error: {e}")
            return "Ne pare rău, nu am putut genera un răspuns momentan."