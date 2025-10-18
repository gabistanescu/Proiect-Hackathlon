"""
Migration: Add visibility, feedback and suggestions tables

This migration:
1. Adds 'visibility' and 'published_at' columns to materials table
2. Creates material_suggestions table
3. Creates suggestion_comments table  
4. Creates material_feedback_professors table
5. Creates material_feedback_students table
"""

import sqlite3
import os
from datetime import datetime

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'roedu.db')
    
    if not os.path.exists(db_path):
        print("Database not found. Please run the application first to create it.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Add visibility column to materials
        cursor.execute("PRAGMA table_info(materials)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'visibility' not in columns:
            print("Adding 'visibility' column to materials table...")
            cursor.execute("ALTER TABLE materials ADD COLUMN visibility TEXT DEFAULT 'public'")
            print("✅ Added 'visibility' column")
        else:
            print("ℹ️  Column 'visibility' already exists")
            
        if 'published_at' not in columns:
            print("Adding 'published_at' column to materials table...")
            cursor.execute(f"ALTER TABLE materials ADD COLUMN published_at TIMESTAMP DEFAULT '{datetime.utcnow().isoformat()}'")
            print("✅ Added 'published_at' column")
        else:
            print("ℹ️  Column 'published_at' already exists")
        
        # 2. Create material_suggestions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS material_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                professor_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
                FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created material_suggestions table")
        
        # 3. Create suggestion_comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS suggestion_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                suggestion_id INTEGER NOT NULL,
                professor_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (suggestion_id) REFERENCES material_suggestions(id) ON DELETE CASCADE,
                FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created suggestion_comments table")
        
        # 4. Create material_feedback_professors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS material_feedback_professors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                professor_id INTEGER NOT NULL,
                helpful INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
                FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
                UNIQUE(material_id, professor_id)
            )
        """)
        print("✅ Created material_feedback_professors table")
        
        # 5. Create material_feedback_students table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS material_feedback_students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                helpful INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                UNIQUE(material_id, student_id)
            )
        """)
        print("✅ Created material_feedback_students table")
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_suggestions_material ON material_suggestions(material_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_suggestions_status ON material_suggestions(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_prof_material ON material_feedback_professors(material_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_stud_material ON material_feedback_students(material_id)")
        print("✅ Created indexes")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\nNew features added:")
        print("  • Visibility control (public, professors_only, private)")
        print("  • Material suggestions (GitHub-style issues)")
        print("  • Separate feedback for professors and students")
        print("  • Comments on suggestions")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
