from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMINISTRATOR = "administrator"
    PROFESSOR = "professor"
    STUDENT = "student"

class ProfileType(str, Enum):
    REAL = "real"
    TEHNOLOGIC = "tehnologic"
    UMAN = "uman"

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Administrator Schemas
class AdministratorCreate(UserCreate):
    school_name: Optional[str] = None
    phone: Optional[str] = None

class AdministratorUpdate(BaseModel):
    school_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class AdministratorResponse(UserResponse):
    school_name: Optional[str] = None
    phone: Optional[str] = None
    last_password_change: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# Professor Schemas
class ProfessorCreate(UserCreate):
    department: Optional[str] = None
    subjects: Optional[str] = None
    phone: Optional[str] = None

class ProfessorUpdate(BaseModel):
    department: Optional[str] = None
    subjects: Optional[str] = None
    phone: Optional[str] = None

class ProfessorResponse(UserResponse):
    department: Optional[str] = None
    subjects: Optional[str] = None
    phone: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Student Schemas
class StudentCreate(UserCreate):
    profile_type: ProfileType = ProfileType.UMAN
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    school_name: Optional[str] = None

class StudentUpdate(BaseModel):
    profile_type: Optional[ProfileType] = None
    grade_level: Optional[int] = Field(None, ge=9, le=12)
    school_name: Optional[str] = None

class StudentResponse(UserResponse):
    profile_type: ProfileType
    grade_level: Optional[int] = None
    school_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Login Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None