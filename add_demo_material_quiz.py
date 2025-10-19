#!/usr/bin/env python3
"""
Script to add DEMO Material and Quiz to RoEdu Database
Adds: "Factori și Divizibilitate" material + AI-generated quiz
"""

import sqlite3
import json
from datetime import datetime

DB_PATH = '/Users/alexsmarandache/Desktop/Proiect-Hackathlon/roedu-backend/roedu.db'

MATERIAL_CONTENT = """FACTORI ȘI DIVIZIBILITATE - CURS COMPLET PENTRU CLASA A 9-A

========================================
1. DEFINIȚII FUNDAMENTALE
========================================

FACTOR: Se spune că numărul a este factor (sau divizor) al lui b dacă b = a × k, pentru un număr întreg k.
Notație: a | b (citim "a divide b")

MULTIPLU: Se spune că b este multiplu al lui a dacă b = a × k, pentru un număr întreg k.
Notație: a ⋮ b (citim "a este multiplu de b")

EXEMPLE:
- 3 este factor al lui 12 (pentru că 12 = 3 × 4)
- 12 este multiplu al lui 3 (pentru că 12 = 3 × 4)
- Factorii lui 12 sunt: 1, 2, 3, 4, 6, 12
- Multiplii lui 3 sunt: 3, 6, 9, 12, 15, 18, 21, ...

========================================
2. DIVIZIBILITATE - REGULI DE BAZĂ
========================================

REGULA DIVIZIBILITĂȚII CU 2:
Un număr este divizibil cu 2 dacă ultima sa cifră este pară (0, 2, 4, 6, 8).
Exemple: 14, 26, 38, 100 sunt divizibile cu 2
Contraexemple: 13, 25, 37 nu sunt divizibile cu 2

REGULA DIVIZIBILITĂȚII CU 3:
Un număr este divizibil cu 3 dacă suma cifrelor sale este divizibilă cu 3.
Exemplu: 123 → 1+2+3 = 6, iar 6 este divizibil cu 3, deci 123 este divizibil cu 3
Verificare: 123 ÷ 3 = 41 ✓

REGULA DIVIZIBILITĂȚII CU 5:
Un număr este divizibil cu 5 dacă ultima sa cifră este 0 sau 5.
Exemple: 15, 20, 35, 100 sunt divizibile cu 5
Contraexemple: 12, 23, 37 nu sunt divizibile cu 5

REGULA DIVIZIBILITĂȚII CU 10:
Un număr este divizibil cu 10 dacă ultima sa cifră este 0.
Exemple: 20, 50, 100, 3000 sunt divizibile cu 10
Contraexemple: 25, 99, 101 nu sunt divizibile cu 10

========================================
3. NUMERE PRIME ȘI COMPUSE
========================================

NUMĂR PRIM: Număr natural mai mare decât 1, care are exact doi divizori: 1 și el însuși.
Primele 10 numere prime: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29

NUMĂR COMPUS: Număr natural care are mai mult de doi divizori.
Exemple: 4 (divizori: 1, 2, 4), 6 (divizori: 1, 2, 3, 6), 12 (divizori: 1, 2, 3, 4, 6, 12)

DESCOMPUNEREA ÎN FACTORI PRIMI:
Orice număr compus poate fi scris ca produs de numere prime.
Exemple:
- 12 = 2² × 3
- 20 = 2² × 5
- 30 = 2 × 3 × 5
- 100 = 2² × 5²

========================================
4. CEL MAI MARE DIVIZOR COMUN (CMMDC)
========================================

DEFINIȚIE: CMMDC a doi sau mai multor numere este cel mai mare număr care le divide pe toate.

EXEMPLU: Aflați CMMDC(24, 36)
24 = 2³ × 3
36 = 2² × 3²
Factori comuni: 2² și 3
CMMDC(24, 36) = 2² × 3 = 4 × 3 = 12

========================================
5. CEL MAI MIC MULTIPLU COMUN (CMMMC)
========================================

DEFINIȚIE: CMMMC a doi sau mai multor numere este cel mai mic număr care este multiplu al tuturor.

EXEMPLU: Aflați CMMMC(12, 18)
12 = 2² × 3
18 = 2 × 3²
Toți factorii cu puterea max: 2² și 3²
CMMMC(12, 18) = 2² × 3² = 4 × 9 = 36

========================================
6. EXERCIȚII PRACTICE
========================================

EXERCIȚIU 1: Aflați toți factorii numărului 24.
SOLUȚIE: 1, 2, 3, 4, 6, 8, 12, 24

EXERCIȚIU 2: Este 147 divizibil cu 3? Justificați!
SOLUȚIE: 1+4+7 = 12, iar 1+2 = 3 (divizibil cu 3)
Deci 147 este divizibil cu 3. Verificare: 147 ÷ 3 = 49 ✓

EXERCIȚIU 3: Descompuneți 72 în factori primi.
SOLUȚIE: 72 = 2³ × 3²

EXERCIȚIU 4: Aflați CMMDC(20, 30, 40)
SOLUȚIE:
20 = 2² × 5
30 = 2 × 3 × 5
40 = 2³ × 5
CMMDC = 2 × 5 = 10

EXERCIȚIU 5: Aflați CMMMC(4, 6, 8)
SOLUȚIE:
4 = 2²
6 = 2 × 3
8 = 2³
CMMMC = 2³ × 3 = 8 × 3 = 24"""


def add_demo_data():
    """Add demo material and quiz using SQL"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Find professor Ana
        cursor.execute("SELECT id FROM users WHERE email = 'ana.popescu@roedu.ro'")
        prof_row = cursor.fetchone()
        
        if not prof_row:
            print("❌ Professor Ana not found!")
            return False
        
        prof_id = prof_row[0]
        print(f"✅ Found Professor Ana (ID: {prof_id})")
        
        # Check if material already exists
        cursor.execute("SELECT id FROM materials WHERE title = ?", 
                      ("Factori și Divizibilitate - Matematică",))
        if cursor.fetchone():
            print("⚠️  Material already exists, skipping...")
            return False
        
        # Add Material
        print("📚 Creating demo material...")
        now = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO materials 
            (title, description, content, subject, grade_level, visibility, is_shared, professor_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Factori și Divizibilitate - Matematică",
            "Curs complet despre factori, multipli și divizibilitate cu exerciții practice",
            MATERIAL_CONTENT,
            "Matematică",
            9,
            "public",
            1,
            prof_id,
            now,
            now
        ))
        material_id = cursor.lastrowid
        print(f"✅ Material created: ID {material_id}")
        
        # Add Quiz
        print("📝 Creating demo quiz...")
        cursor.execute("""
            INSERT INTO quizzes 
            (title, description, subject, grade_level, professor_id, time_limit, is_ai_generated, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Test Factori și Divizibilitate",
            "Test de evaluare asupra conceptelor de factori, divizibilitate și numere prime",
            "Matematică",
            9,
            prof_id,
            30,
            0,
            now,
            now
        ))
        quiz_id = cursor.lastrowid
        print(f"✅ Quiz created: ID {quiz_id}")
        
        # Question 1: Single Choice
        print("❓ Adding Question 1: Single Choice...")
        cursor.execute("""
            INSERT INTO questions 
            (quiz_id, question_text, question_type, options, correct_answers, order_index, points)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            "Care este descompunerea în factori primi a numărului 60?",
            "SINGLE_CHOICE",
            json.dumps(["2 × 3 × 5", "2² × 3 × 5", "2 × 3² × 5", "2² × 3² × 5"]),
            json.dumps(["2² × 3 × 5"]),
            0,
            10
        ))
        print("✅ Question 1 added")
        
        # Question 2: Multiple Choice
        print("❓ Adding Question 2: Multiple Choice...")
        cursor.execute("""
            INSERT INTO questions 
            (quiz_id, question_text, question_type, options, correct_answers, order_index, points)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            "Care dintre următoarele numere sunt divizibile cu 3? (Selectați toate variantele corecte)",
            "MULTIPLE_CHOICE",
            json.dumps(["123", "124", "153", "155", "246"]),
            json.dumps(["123", "153", "246"]),
            1,
            10
        ))
        print("✅ Question 2 added")
        
        # Question 3: Free Text
        print("❓ Adding Question 3: Free Text...")
        cursor.execute("""
            INSERT INTO questions 
            (quiz_id, question_text, question_type, options, correct_answers, order_index, points)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            """Un florărie are 24 trandafiri roșii și 36 trandafiri albi. Florarista dorește să facă buchete identice folosind toți trandafirii, fără a rămâne niciun trandafir.

a) Câte buchete identice poate face?
b) Câți trandafiri roșii vor fi într-un buchet?
c) Câți trandafiri albi vor fi într-un buchet?

Arătați calculele complete!""",
            "FREE_TEXT",
            None,
            json.dumps(["12", "2", "3"]),
            2,
            10
        ))
        print("✅ Question 3 added")
        
        # Commit
        conn.commit()
        
        print("\n" + "="*50)
        print("🎉 DEMO MATERIAL AND QUIZ ADDED SUCCESSFULLY!")
        print("="*50)
        print(f"Material ID: {material_id}")
        print(f"Quiz ID: {quiz_id}")
        print(f"Questions: 3 (1 Single Choice, 1 Multiple Choice, 1 Free Text)")
        print("Status: ✅ Ready for demo")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    success = add_demo_data()
    sys.exit(0 if success else 1)
