"""
Quick script to check database contents
"""
import sqlite3
import os

# Change to the script's directory to find the database
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

db_path = "roedu.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print(f"Database: {db_path}")
    print(f"Tables found: {len(tables)}")
    print("-" * 50)
    
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  {table_name}: {count} rows")
    
    conn.close()
else:
    print(f"Database file not found: {db_path}")
