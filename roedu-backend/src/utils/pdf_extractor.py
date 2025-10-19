"""
PDF Text Extraction Utility
Extracts text from PDF files for use in AI quiz generation
"""

import logging
from pathlib import Path
from typing import Optional
import os

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str, max_chars: int = 10000) -> Optional[str]:
    """
    Extract text from a PDF file
    
    Args:
        file_path: Path to PDF file (can be relative or absolute)
        max_chars: Maximum characters to extract (default 10000)
    
    Returns:
        Extracted text or None if extraction fails
    """
    try:
        from pypdf import PdfReader
        
        # Handle both absolute and relative paths
        if not os.path.isabs(file_path):
            # Try relative to project root
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
            file_path = os.path.join(project_root, file_path.lstrip('/'))
        
        if not os.path.exists(file_path):
            logger.warning(f"PDF file not found: {file_path}")
            return None
        
        # Extract text
        text = ""
        pdf = PdfReader(file_path)
        
        # Extract from each page
        for page_num, page in enumerate(pdf.pages):
            if len(text) >= max_chars:
                break
            
            try:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            except Exception as e:
                logger.warning(f"Failed to extract text from page {page_num}: {str(e)}")
                continue
        
        # Truncate to max_chars
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        return text.strip() if text.strip() else None
        
    except ImportError:
        logger.error("pypdf not installed. Install with: pip install pypdf")
        return None
    except Exception as e:
        logger.error(f"Failed to extract PDF text: {str(e)}")
        return None


def extract_text_from_multiple_pdfs(file_paths: list, max_chars_per_file: int = 3000) -> str:
    """
    Extract text from multiple PDF files and combine them
    
    Args:
        file_paths: List of file paths
        max_chars_per_file: Max characters from each file
    
    Returns:
        Combined text from all PDFs
    """
    combined_text = ""
    
    for file_path in file_paths:
        if not file_path.lower().endswith('.pdf'):
            continue
        
        text = extract_text_from_pdf(file_path, max_chars_per_file)
        if text:
            combined_text += f"\n--- From: {Path(file_path).name} ---\n{text}"
    
    return combined_text.strip()
