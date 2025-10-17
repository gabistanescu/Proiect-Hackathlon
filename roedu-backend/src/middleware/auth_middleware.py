from fastapi import Request, HTTPException
from fastapi.security import OAuth2PasswordBearer
from src.services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def auth_middleware(request: Request, call_next):
    token = request.headers.get("Authorization")
    
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        user = AuthService.verify_token(token)
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid token")
    
    request.state.user = user
    response = await call_next(request)
    return response