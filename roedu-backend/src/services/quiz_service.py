from sqlalchemy.orm import Session
from models.quiz import Quiz
from schemas.quiz_schema import QuizCreate, QuizUpdate

class QuizService:
    def __init__(self, db: Session):
        self.db = db

    def create_quiz(self, quiz: QuizCreate):
        db_quiz = Quiz(**quiz.dict())
        self.db.add(db_quiz)
        self.db.commit()
        self.db.refresh(db_quiz)
        return db_quiz

    def get_quiz(self, quiz_id: int):
        return self.db.query(Quiz).filter(Quiz.id == quiz_id).first()

    def update_quiz(self, quiz_id: int, quiz: QuizUpdate):
        db_quiz = self.get_quiz(quiz_id)
        if db_quiz:
            for key, value in quiz.dict(exclude_unset=True).items():
                setattr(db_quiz, key, value)
            self.db.commit()
            self.db.refresh(db_quiz)
            return db_quiz
        return None

    def delete_quiz(self, quiz_id: int):
        db_quiz = self.get_quiz(quiz_id)
        if db_quiz:
            self.db.delete(db_quiz)
            self.db.commit()
            return db_quiz
        return None

    def get_all_quizzes(self):
        return self.db.query(Quiz).all()