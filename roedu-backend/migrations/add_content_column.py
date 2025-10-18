"""
Add content column to materials table

This migration adds a 'content' column to store rich text HTML content
"""

import sqlite3
import os

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'roedu.db')
    
    if not os.path.exists(db_path):
        print("Database not found. Please run the application first to create it.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(materials)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'content' not in columns:
            print("Adding 'content' column to materials table...")
            cursor.execute("ALTER TABLE materials ADD COLUMN content TEXT")
            conn.commit()
            print("✅ Migration completed successfully!")
        else:
            print("ℹ️  Column 'content' already exists. Skipping migration.")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
