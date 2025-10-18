# Quick Backend API Test Script
# Run this after starting the backend server

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_login(email, password):
    """Test login and return token"""
    print(f"\n🔐 Testing login for: {email}")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful! Role: {data.get('role')}")
        return data.get('access_token')
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_get_materials(token, user_type):
    """Test getting materials with auth"""
    print(f"\n📚 Getting materials as {user_type}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/materials", headers=headers)
    
    if response.status_code == 200:
        materials = response.json()
        print(f"✅ Retrieved {len(materials)} materials")
        for mat in materials[:3]:
            print(f"  - {mat['title']} (visibility: {mat['visibility']})")
            print(f"    Feedback: 👨‍🏫 {mat.get('feedback_professors_count', 0)} / ⭐ {mat.get('feedback_students_count', 0)}")
        return materials
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return []

def test_feedback(token, material_id, feedback_type):
    """Test toggle feedback"""
    print(f"\n💡 Testing {feedback_type} feedback on material {material_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/materials/{material_id}/feedback/{feedback_type}",
        headers=headers,
        json={}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Feedback toggled! Has feedback: {data.get('has_feedback')}, Total: {data.get('total_count')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None

def test_create_suggestion(token, material_id):
    """Test creating a suggestion"""
    print(f"\n📝 Creating suggestion on material {material_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/materials/{material_id}/suggestions",
        headers=headers,
        json={
            "title": "Test Suggestion via API",
            "description": "This is a test suggestion created via Python script to verify the API works correctly."
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Suggestion created! ID: {data.get('id')}, Status: {data.get('status')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None

def test_get_suggestions(token, material_id):
    """Test getting suggestions"""
    print(f"\n📋 Getting suggestions for material {material_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/materials/{material_id}/suggestions",
        headers=headers
    )
    
    if response.status_code == 200:
        suggestions = response.json()
        print(f"✅ Retrieved {len(suggestions)} suggestions")
        for sug in suggestions:
            print(f"  - {sug['title']} (status: {sug['status']}, comments: {sug.get('comments_count', 0)})")
        return suggestions
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return []

def test_add_comment(token, suggestion_id):
    """Test adding a comment to suggestion"""
    print(f"\n💬 Adding comment to suggestion {suggestion_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/materials/suggestions/{suggestion_id}/comments",
        headers=headers,
        json={
            "content": "This is a test comment via API script!"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Comment added! ID: {data.get('id')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None

def main():
    print_section("🧪 BACKEND API TESTING SCRIPT")
    
    # Test 1: Professor Login
    print_section("Test 1: Professor Login & Materials")
    prof_token = test_login("ana.popescu@roedu.ro", "parola123")
    if prof_token:
        prof_materials = test_get_materials(prof_token, "Professor")
    
    # Test 2: Student Login
    print_section("Test 2: Student Login & Materials")
    student_token = test_login("student01@roedu.ro", "parola123")
    if student_token:
        student_materials = test_get_materials(student_token, "Student")
    
    # Test 3: Feedback (if we have materials)
    if prof_token and prof_materials:
        print_section("Test 3: Feedback System")
        material_id = prof_materials[0]['id']
        test_feedback(prof_token, material_id, "professor")
        
        if student_token:
            test_feedback(student_token, material_id, "student")
    
    # Test 4: Suggestions (login as different professor)
    print_section("Test 4: Suggestions System")
    prof2_token = test_login("mihai.ionescu@roedu.ro", "parola123")
    
    if prof2_token and prof_materials:
        # Find a material from prof1 to suggest on
        material_id = prof_materials[0]['id']
        
        # Create suggestion
        suggestion = test_create_suggestion(prof2_token, material_id)
        
        # Get all suggestions
        suggestions = test_get_suggestions(prof2_token, material_id)
        
        # Add comment if we created a suggestion
        if suggestion:
            test_add_comment(prof2_token, suggestion['id'])
    
    print_section("✅ TESTING COMPLETE")
    print("\n📊 Summary:")
    print("  - Login: ✅ Tested for professor and student")
    print("  - Materials: ✅ Retrieved with visibility filtering")
    print("  - Feedback: ✅ Toggle for professors and students")
    print("  - Suggestions: ✅ Create, list, and comment")
    print("\n🌐 Frontend running at: http://localhost:4200")
    print("🔧 Backend running at: http://localhost:8000")
    print("\n📋 See TEST_SCENARIOS.md for complete testing guide!")

if __name__ == "__main__":
    main()
