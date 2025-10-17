import json
from typing import Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Query

def generate_response(data: Any, message: str = "Success") -> dict:
    """Generate a standardized success response"""
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def handle_error(message: str, status_code: int = 400) -> dict:
    """Handle errors and return a standardized error response"""
    return {
        "status": "error",
        "message": message,
        "status_code": status_code
    }

def paginate_results(query: Query, page: int = 1, page_size: int = 10) -> dict:
    """
    Paginate SQLAlchemy query results
    Returns: dict with items, total, page, page_size, total_pages
    """
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def format_date(date: Optional[datetime]) -> Optional[str]:
    """Format date to ISO 8601 string format"""
    if date is None:
        return None
    return date.isoformat()

def parse_json_field(field: Optional[str]) -> Any:
    """Parse JSON string field from database"""
    if not field:
        return None
    try:
        return json.loads(field)
    except json.JSONDecodeError:
        return None

def serialize_json_field(data: Any) -> str:
    """Serialize data to JSON string for database storage"""
    if data is None:
        return ""
    return json.dumps(data)

def parse_tags(tags_str: Optional[str]) -> List[str]:
    """Parse comma-separated tags string"""
    if not tags_str:
        return []
    return [tag.strip() for tag in tags_str.split(",") if tag.strip()]

def serialize_tags(tags: List[str]) -> str:
    """Serialize tags list to comma-separated string"""
    if not tags:
        return ""
    return ",".join(tags)

def validate_email_domain(email: str, allowed_domains: Optional[List[str]] = None) -> bool:
    """
    Validate email domain against allowed domains
    For student validation (e.g., must be school email)
    """
    if not allowed_domains:
        return True
    
    domain = email.split("@")[-1]
    return domain in allowed_domains