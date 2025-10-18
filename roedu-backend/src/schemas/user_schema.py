from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
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
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        """Truncate password to 72 bytes for bcrypt compatibility"""
        if not v:
            return v
        password_bytes = v.encode('utf-8')
        if len(password_bytes) <= 72:
            return v
        
        # Truncate to 72 bytes, ensuring we don't cut a multi-byte character
        truncated = password_bytes[:72]
        while len(truncated) > 0:
            try:
                return truncated.decode('utf-8')
            except UnicodeDecodeError:
                truncated = truncated[:-1]
        return v

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: Optional[str]) -> Optional[str]:
        """Truncate password to 72 bytes for bcrypt compatibility"""
        if not v:
            return v
        password_bytes = v.encode('utf-8')
        if len(password_bytes) <= 72:
            return v
        
        # Truncate to 72 bytes, ensuring we don't cut a multi-byte character
        truncated = password_bytes[:72]
        while len(truncated) > 0:
            try:
                return truncated.decode('utf-8')
            except UnicodeDecodeError:
                truncated = truncated[:-1]
        return v

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
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: Optional[str]) -> Optional[str]:
        """Truncate password to 72 bytes for bcrypt compatibility"""
        if not v:
            return v
        password_bytes = v.encode('utf-8')
        if len(password_bytes) <= 72:
            return v
        
        truncated = password_bytes[:72]
        while len(truncated) > 0:
            try:
                return truncated.decode('utf-8')
            except UnicodeDecodeError:
                truncated = truncated[:-1]
        return v

class AdministratorResponse(UserResponse):
    school_name: Optional[str] = None
    phone: Optional[str] = None
    last_password_change: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class AdministratorManagedCreate(AdministratorCreate):
    role: UserRole = UserRole.ADMINISTRATOR

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

class ProfessorManagedCreate(ProfessorCreate):
    role: UserRole = UserRole.PROFESSOR

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

class StudentManagedCreate(StudentCreate):
    role: UserRole = UserRole.STUDENT

# Login Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def truncate_password(cls, v: str) -> str:
        """Truncate password to 72 bytes for bcrypt compatibility"""
        if not v:
            return v
        password_bytes = v.encode('utf-8')
        if len(password_bytes) <= 72:
            return v
        
        truncated = password_bytes[:72]
        while len(truncated) > 0:
            try:
                return truncated.decode('utf-8')
            except UnicodeDecodeError:
                truncated = truncated[:-1]
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None
