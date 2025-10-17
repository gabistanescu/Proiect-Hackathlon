from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.config.database import Base
from datetime import datetime

class Administrator(Base):
    __tablename__ = 'administrators'

    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    school_name = Column(String(255))
    phone = Column(String(20))
    last_password_change = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to user
    user = relationship("User", foreign_keys=[id])

    def __repr__(self):
        return f"<Administrator(id={self.id}, school_name={self.school_name})>"