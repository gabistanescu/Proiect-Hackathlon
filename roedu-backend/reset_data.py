"""
Script to clear data from database using SQLite directly
"""
import sqlite3
import os
import sys

# Change to the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

db_path = "roedu.db"

def clear_all_data():
    """Clear all data from all tables"""
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Clearing all data...")
        
        # Disable foreign key constraints temporarily
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Clear each table
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
            print(f"✅ Cleared table: {table}")
        
        # Re-enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON")
        
        conn.commit()
        print("\n✅ All data cleared successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def clear_users_only():
    """Clear only user-related data"""
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Clearing user data...")
        
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        user_tables = ["students", "professors", "administrators", "users"]
        
        for table in user_tables:
            cursor.execute(f"DELETE FROM {table}")
            print(f"✅ Cleared table: {table}")
        
        cursor.execute("PRAGMA foreign_keys = ON")
        
        conn.commit()
        print("\n✅ User data cleared successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        conn.close()

def show_current_data():
    """Show current data counts"""
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\nCurrent database contents:")
    print("-" * 50)
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"  {table}: {count} rows")
    
    conn.close()

if __name__ == "__main__":
    show_current_data()
    
    print("\n" + "="*50)
    print("Database Reset Options:")
    print("1. Clear ALL data (users, content, everything)")
    print("2. Clear only users (administrators, professors, students)")
    print("3. Show current data")
    print("4. Cancel")
    
    choice = input("\nEnter your choice (1-4): ")
    
    if choice == "1":
        confirm = input("\n⚠️  This will delete ALL data. Type 'yes' to confirm: ")
        if confirm.lower() == "yes":
            clear_all_data()
            show_current_data()
        else:
            print("Operation cancelled.")
    elif choice == "2":
        confirm = input("\n⚠️  This will delete all user data. Type 'yes' to confirm: ")
        if confirm.lower() == "yes":
            clear_users_only()
            show_current_data()
        else:
            print("Operation cancelled.")
    elif choice == "3":
        show_current_data()
    else:
        print("Operation cancelled.")
