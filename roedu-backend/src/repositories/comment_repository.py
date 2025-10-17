from sqlalchemy.orm import Session
from models.comment import Comment
from schemas.comment_schema import CommentCreate, CommentUpdate

class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_comment(self, comment: CommentCreate):
        db_comment = Comment(**comment.dict())
        self.db.add(db_comment)
        self.db.commit()
        self.db.refresh(db_comment)
        return db_comment

    def get_comment(self, comment_id: int):
        return self.db.query(Comment).filter(Comment.id == comment_id).first()

    def get_comments(self, material_id: int):
        return self.db.query(Comment).filter(Comment.material_id == material_id).all()

    def update_comment(self, comment_id: int, comment: CommentUpdate):
        db_comment = self.get_comment(comment_id)
        if db_comment:
            for key, value in comment.dict(exclude_unset=True).items():
                setattr(db_comment, key, value)
            self.db.commit()
            self.db.refresh(db_comment)
        return db_comment

    def delete_comment(self, comment_id: int):
        db_comment = self.get_comment(comment_id)
        if db_comment:
            self.db.delete(db_comment)
            self.db.commit()
        return db_comment