from pydantic import BaseModel, EmailStr, constr, validator

class UserValidator(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    
    @validator('password')
    def password_complexity(cls, value):
        if not any(char.isdigit() for char in value):
            raise ValueError('Password must contain at least one digit.')
        if not any(char.isalpha() for char in value):
            raise ValueError('Password must contain at least one letter.')
        return value

class MaterialValidator(BaseModel):
    title: str
    description: str
    tags: list[constr(min_length=1)]

class QuizValidator(BaseModel):
    title: str
    questions: list[dict]  # Define a more specific schema for questions if needed

class CommentValidator(BaseModel):
    content: constr(min_length=1)
    user_id: int
    material_id: int

# Additional validators can be added as needed for other models and functionalities.