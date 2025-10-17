from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from src.config.database import get_db
from src.config.settings import settings
from src.services.auth_service import AuthService, get_current_user
from src.schemas.user_schema import (
    UserCreate, UserResponse, Token, LoginRequest,
    AdministratorCreate, ProfessorCreate, StudentCreate,
    AdministratorResponse, ProfessorResponse, StudentResponse
)
from src.models.user import User, UserRole
from src.models.administrator import Administrator
from src.models.professor import Professor
from src.models.student import Student

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (any role)
    """
    user = AuthService.register_user(user_data, db)
    return user

@router.post("/register/administrator", response_model=AdministratorResponse, status_code=status.HTTP_201_CREATED)
def register_administrator(admin_data: AdministratorCreate, db: Session = Depends(get_db)):
    """
    Register a new administrator
    """
    user = AuthService.register_user(admin_data, db)
    admin = db.query(Administrator).filter(Administrator.id == user.id).first()
    return {**user.__dict__, **admin.__dict__}

@router.post("/register/professor", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
def register_professor(prof_data: ProfessorCreate, db: Session = Depends(get_db)):
    """
    Register a new professor
    """
    user = AuthService.register_user(prof_data, db)
    professor = db.query(Professor).filter(Professor.id == user.id).first()
    return {**user.__dict__, **professor.__dict__}

@router.post("/register/student", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def register_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    """
    Register a new student
    Requires valid student email domain
    """
    user = AuthService.register_user(student_data, db)
    student = db.query(Student).filter(Student.id == user.id).first()
    return {**user.__dict__, **student.__dict__}

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password
    Returns JWT access token
    """
    user = AuthService.authenticate_user(login_data.email, login_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login (for Swagger UI)
    """
    user = AuthService.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return current_user

@router.get("/verify")
def verify_token(current_user: User = Depends(get_current_user)):
    """
    Verify if the token is valid
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "role": current_user.role.value
    }