from typing import List, Dict, Any
import json
from sqlalchemy.orm import Session
from datetime import datetime


def _seed_definitions(user_role_cls, profile_type_cls) -> List[Dict[str, Any]]:
    """Prepare the default user dataset."""
    return [
        {
            "username": "admin",
            "email": "admin@roedu.ro",
            "password": "Admin123!",
            "role": user_role_cls.ADMINISTRATOR,
            "school_name": "Colegiul National Bucuresti",
            "phone": "0712345678",
        },
        {
            "username": "prof.ana",
            "email": "ana.popescu@roedu.ro",
            "password": "Prof1234!",
            "role": user_role_cls.PROFESSOR,
            "department": "Matematica",
            "subjects": "Algebra,Geometrie",
            "phone": "0720123456",
        },
        {
            "username": "prof.mihai",
            "email": "mihai.ionescu@roedu.ro",
            "password": "Prof1234!",
            "role": user_role_cls.PROFESSOR,
            "department": "Informatica",
            "subjects": "Programare,Algoritmi",
            "phone": "0720456123",
        },
        {
            "username": "prof.elena",
            "email": "elena.marinescu@roedu.ro",
            "password": "Prof1234!",
            "role": user_role_cls.PROFESSOR,
            "department": "Limbi Moderne",
            "subjects": "Engleza,Franceza",
            "phone": "0720789456",
        },
        {
            "username": "prof.ion",
            "email": "ion.dumitru@roedu.ro",
            "password": "Prof1234!",
            "role": user_role_cls.PROFESSOR,
            "department": "Istorie si Stiinte Sociale",
            "subjects": "Istorie,Geografie",
            "phone": "0720567890",
        },
        {
            "username": "student01",
            "email": "andrei.pop@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.REAL,
            "grade_level": 9,
            "school_name": "Colegiul National Bucuresti",
        },
        {
            "username": "student02",
            "email": "bianca.ilie@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.UMAN,
            "grade_level": 10,
            "school_name": "Colegiul National Bucuresti",
        },
        {
            "username": "student03",
            "email": "catalin.stoica@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.TEHNOLOGIC,
            "grade_level": 11,
            "school_name": "Colegiul Tehnic Energetic",
        },
        {
            "username": "student04",
            "email": "daniela.radu@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.REAL,
            "grade_level": 12,
            "school_name": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "username": "student05",
            "email": "emanuel.marin@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.UMAN,
            "grade_level": 9,
            "school_name": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "username": "student06",
            "email": "florentina.dinu@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.TEHNOLOGIC,
            "grade_level": 10,
            "school_name": "Colegiul Tehnic Energetic",
        },
        {
            "username": "student07",
            "email": "george.petrescu@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.REAL,
            "grade_level": 11,
            "school_name": "Colegiul National Bucuresti",
        },
        {
            "username": "student08",
            "email": "hortensia.neagu@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.UMAN,
            "grade_level": 12,
            "school_name": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "username": "student09",
            "email": "ioan.vasile@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.TEHNOLOGIC,
            "grade_level": 9,
            "school_name": "Colegiul Tehnic Energetic",
        },
        {
            "username": "student10",
            "email": "julia.matei@roedu.ro",
            "password": "Stud1234!",
            "role": user_role_cls.STUDENT,
            "profile_type": profile_type_cls.REAL,
            "grade_level": 10,
            "school_name": "Colegiul National Bucuresti",
        },
    ]


def seed_initial_data(session: Session) -> None:
    """Insert default administrator, professors, and students if they are missing."""
    from src.models.user import User, UserRole
    from src.models.administrator import Administrator
    from src.models.professor import Professor
    from src.models.student import Student, ProfileType
    from src.models.group import Group
    from src.models.quiz import Quiz, Question, QuestionType
    from src.services.auth_service import AuthService  # Local import to avoid circular dependency

    seed_data = _seed_definitions(UserRole, ProfileType)

    try:
        created_any = False
        professor_map = {}  # Map professor emails to their ID
        student_map = {}  # Map student emails to their ID
        
        # Create users
        for entry in seed_data:
            existing_user = session.query(User).filter(
                (User.email == entry["email"]) | (User.username == entry["username"])
            ).first()

            if existing_user:
                if entry["role"] == UserRole.PROFESSOR:
                    professor_map[entry["email"]] = existing_user.id
                elif entry["role"] == UserRole.STUDENT:
                    student_map[entry["email"]] = existing_user.id
                continue

            hashed_password = AuthService.get_password_hash(entry["password"])

            user = User(
                username=entry["username"],
                email=entry["email"],
                hashed_password=hashed_password,
                role=entry["role"],
                is_active=1,
            )
            session.add(user)
            session.flush()  # Ensure user ID is available

            if entry["role"] == UserRole.ADMINISTRATOR:
                session.add(
                    Administrator(
                        id=user.id,
                        school_name=entry.get("school_name"),
                        phone=entry.get("phone"),
                    )
                )
            elif entry["role"] == UserRole.PROFESSOR:
                session.add(
                    Professor(
                        id=user.id,
                        department=entry.get("department"),
                        subjects=entry.get("subjects"),
                        phone=entry.get("phone"),
                    )
                )
                professor_map[entry["email"]] = user.id
            elif entry["role"] == UserRole.STUDENT:
                session.add(
                    Student(
                        id=user.id,
                        profile_type=entry.get("profile_type", ProfileType.UMAN),
                        grade_level=entry.get("grade_level"),
                        school_name=entry.get("school_name"),
                    )
                )
                student_map[entry["email"]] = user.id

            created_any = True

        session.flush()

        # Create groups for professor Ana
        prof_ana_id = professor_map.get("ana.popescu@roedu.ro")
        if prof_ana_id and not session.query(Group).filter(Group.professor_id == prof_ana_id).first():
            # Group 1: Algebra Clasa 9A
            group1 = Group(
                name="Algebra - Clasa 9A",
                description="Grup pentru elevii care studiaza algebra in clasa a 9-a",
                subject="Matematica",
                grade_level=9,
                professor_id=prof_ana_id,
                created_at=datetime.utcnow()
            )
            session.add(group1)
            session.flush()
            
            # Add students to group1
            group1_students = [
                student_map.get("andrei.pop@roedu.ro"),
                student_map.get("julia.matei@roedu.ro"),
                student_map.get("george.petrescu@roedu.ro"),
            ]
            for student_id in group1_students:
                if student_id:
                    student = session.query(Student).filter(Student.id == student_id).first()
                    if student:
                        group1.students.append(student)

            # Group 2: Geometrie Clasa 11
            group2 = Group(
                name="Geometrie - Clasa 11",
                description="Grup pentru elevii care studiaza geometrie in clasa a 11-a",
                subject="Matematica",
                grade_level=11,
                professor_id=prof_ana_id,
                created_at=datetime.utcnow()
            )
            session.add(group2)
            session.flush()
            
            # Add students to group2
            group2_students = [
                student_map.get("catalin.stoica@roedu.ro"),
                student_map.get("george.petrescu@roedu.ro"),
            ]
            for student_id in group2_students:
                if student_id:
                    student = session.query(Student).filter(Student.id == student_id).first()
                    if student:
                        group2.students.append(student)

            created_any = True

        session.flush()

        # Create quizzes for professor Ana
        prof_ana_id = professor_map.get("ana.popescu@roedu.ro")
        if prof_ana_id and not session.query(Quiz).filter(Quiz.professor_id == prof_ana_id).first():
            # Quiz 1: Algebra Basics (for group 1)
            group1 = session.query(Group).filter(Group.professor_id == prof_ana_id, Group.name == "Algebra - Clasa 9A").first()
            
            quiz1 = Quiz(
                title="Test Algebra - Operatii cu Numere",
                description="Test pentru verificarea cunostintelor la operatii cu numere pozitive si negative",
                subject="Matematica",
                grade_level=9,
                time_limit=30,
                professor_id=prof_ana_id,
                group_id=group1.id if group1 else None,
                created_at=datetime.utcnow()
            )
            session.add(quiz1)
            session.flush()

            # Add questions to quiz1
            q1_1 = Question(
                quiz_id=quiz1.id,
                question_text="Care este rezultatul calculului: (-5) + 3 - (-2)?",
                question_type=QuestionType.SINGLE_CHOICE,
                options=json.dumps(["0", "1", "2", "3"]),
                correct_answers=json.dumps(["2"]),
                points=25.0,
                order_index=1
            )
            session.add(q1_1)

            q1_2 = Question(
                quiz_id=quiz1.id,
                question_text="Selecteaza toate raspunsurile corecte pentru: Care sunt numerele intregi?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                options=json.dumps(["-5", "-1", "0", "3", "π", "√2"]),
                correct_answers=json.dumps(["-5", "-1", "0", "3"]),
                points=25.0,
                order_index=2
            )
            session.add(q1_2)

            q1_3 = Question(
                quiz_id=quiz1.id,
                question_text="Explica regula semnelor pentru inmultirea numerelor intregi cu exemple.",
                question_type=QuestionType.FREE_TEXT,
                correct_answers=json.dumps(["semnelor", "pozitiv", "negativ", "inmultire"]),
                evaluation_criteria="Raspunsul trebuie sa mentioneze: regula semnelor, cazuri cu numere pozitive/negative, exemple concrete",
                points=50.0,
                order_index=3
            )
            session.add(q1_3)

            # Quiz 2: Geometry Test (for group 2)
            group2 = session.query(Group).filter(Group.professor_id == prof_ana_id, Group.name == "Geometrie - Clasa 11").first()
            
            quiz2 = Quiz(
                title="Test Geometrie - Teorema Pitagora",
                description="Test pentru verificarea cunostintelor la Teorema lui Pitagora si aplicatiile ei",
                subject="Matematica",
                grade_level=11,
                time_limit=45,
                professor_id=prof_ana_id,
                group_id=group2.id if group2 else None,
                created_at=datetime.utcnow()
            )
            session.add(quiz2)
            session.flush()

            # Add questions to quiz2
            q2_1 = Question(
                quiz_id=quiz2.id,
                question_text="Intr-un triunghi dreptunghic, catetele au lungimile 3 si 4. Ipotenuza este:",
                question_type=QuestionType.SINGLE_CHOICE,
                options=json.dumps(["5", "7", "12", "√25"]),
                correct_answers=json.dumps(["5"]),
                points=30.0,
                order_index=1
            )
            session.add(q2_1)

            q2_2 = Question(
                quiz_id=quiz2.id,
                question_text="Care dintre urmatoarele sunt forme corecte ale Teoremei Pitagora?",
                question_type=QuestionType.MULTIPLE_CHOICE,
                options=json.dumps(["a² + b² = c²", "a + b = c", "c² = a² + b²", "ab = c"]),
                correct_answers=json.dumps(["a² + b² = c²", "c² = a² + b²"]),
                points=30.0,
                order_index=2
            )
            session.add(q2_2)

            q2_3 = Question(
                quiz_id=quiz2.id,
                question_text="Descrie o aplicatie practica a Teoremei Pitagora in constructii sau in viata cotidiana.",
                question_type=QuestionType.FREE_TEXT,
                correct_answers=json.dumps(["Pitagora", "triunghi", "distanta", "calcul"]),
                evaluation_criteria="Raspunsul trebuie sa contina: o aplicatie concreta, o legatura cu Teorema Pitagora, o explicatie clara",
                points=40.0,
                order_index=3
            )
            session.add(q2_3)

            created_any = True
        
        # Add public materials for testing AI quiz generation
        from src.models.material import Material, VisibilityType
        prof_ana_id = professor_map.get("ana.popescu@roedu.ro")
        
        if prof_ana_id:
            # Check if materials already exist
            existing_materials = session.query(Material).filter(Material.professor_id == prof_ana_id).count()
            
            if existing_materials == 0:
                # Material 1: Algebra Basics
                material1 = Material(
                    title="Numere Intregi - Operatii Fundamentale",
                    description="Introducere in numere intregi si operatiile fundamentale cu acestea",
                    content="""
                    NUMERE INTREGI - CURS COMPLET
                    
                    1. DEFINITIE
                    Numerele intregi sunt numere care nu au parte zecimala. Includ numere pozitive, negative si zero.
                    Multimea numerelor intregi se noteaza cu Z = {..., -3, -2, -1, 0, 1, 2, 3, ...}
                    
                    2. OPERATII CU NUMERE INTREGI
                    
                    A) ADUNAREA
                    - Pentru numere cu acelasi semn: adunate se valori absolute, rezultatul pastreaza semnul
                    - Pentru numere cu semne diferite: se scade valoarea mai mica din cea mai mare, rezultatul pastreaza semnul celui mai mare
                    Exemple: 5 + 3 = 8, -5 + (-3) = -8, 5 + (-3) = 2, -5 + 3 = -2
                    
                    B) SCADEREA
                    Scaderea unui numar intreg este egala cu adunarea opusului sau
                    a - b = a + (-b)
                    Exemple: 7 - 3 = 4, 7 - (-3) = 7 + 3 = 10
                    
                    C) INMULTIREA
                    Regula semnelor:
                    - pozitiv × pozitiv = pozitiv
                    - negativ × negativ = pozitiv
                    - pozitiv × negativ = negativ
                    - negativ × pozitiv = negativ
                    Exemple: 3 × 4 = 12, (-3) × (-4) = 12, 3 × (-4) = -12
                    
                    D) IMPARTIREA
                    Aceleasi reguli de semn ca la inmultire
                    Impartirea se efectueaza doar daca rezultatul este numar intreg
                    Exemple: 12 ÷ 3 = 4, (-12) ÷ (-3) = 4, 12 ÷ (-3) = -4
                    
                    3. PRIORITATEA OPERATIILOR
                    1. Operatiile din paranteze (daca exista)
                    2. Inmultirea si impartirea (de la stanga la dreapta)
                    3. Adunarea si scaderea (de la stanga la dreapta)
                    
                    Exemplu: 2 + 3 × 4 - 5 = 2 + 12 - 5 = 9
                    """,
                    subject="Matematica",
                    grade_level=9,
                    visibility=VisibilityType.PUBLIC,
                    is_shared=1,
                    professor_id=prof_ana_id,
                    created_at=datetime.utcnow()
                )
                session.add(material1)
                
                # Material 2: Geometry Introduction
                material2 = Material(
                    title="Teorema Pitagora - Fundamentals",
                    description="Curs complet despre Teorema lui Pitagora si aplicatiile ei in geometrie",
                    content="""
                    TEOREMA PITAGORA - CURS COMPLET
                    
                    1. FORMULARE
                    In orice triunghi dreptunghic, patratul lungimii ipotenuzei este egal cu suma patratelor lungimilor catetelor.
                    Formula: c² = a² + b²
                    unde:
                    - c este ipotenuza (latura opusa unghiului drept)
                    - a si b sunt catetele (laturile care formeaza unghiul drept)
                    
                    2. DEMONSTRATIE GEOMETRICA
                    Teorema Pitagora se poate demonstra geometric folosind arii de patrate.
                    Daca desenam patrate pe fiecare latura a unui triunghi dreptunghic, suma ariilor patratelor construite pe catete
                    este egala cu aria patratului construit pe ipotenuza.
                    
                    3. EXEMPLE PRACTICE
                    
                    Exemplu 1: Triunghi cu catetele 3 si 4
                    c² = 3² + 4² = 9 + 16 = 25
                    c = √25 = 5
                    Raspuns: Ipotenuza = 5
                    
                    Exemplu 2: Triunghi cu catetele 5 si 12
                    c² = 5² + 12² = 25 + 144 = 169
                    c = √169 = 13
                    Raspuns: Ipotenuza = 13
                    
                    4. APLICATII PRACTICE
                    - Constructii: calculul diagonalelor in constructii
                    - Navigatie: determinarea distantelor
                    - Cartografie: masurarea distantelor pe harta
                    - Inginerie: proiectarea structurilor
                    
                    5. TRIPLETE PITAGORICE CUNOSCUTE
                    (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25), (9, 40, 41)
                    """,
                    subject="Matematica",
                    grade_level=11,
                    visibility=VisibilityType.PUBLIC,
                    is_shared=1,
                    professor_id=prof_ana_id,
                    created_at=datetime.utcnow()
                )
                session.add(material2)
                
                # Material 3: English Vocabulary
                prof_elena_id = professor_map.get("elena.marinescu@roedu.ro")
                if prof_elena_id:
                    material3 = Material(
                        title="Engleza - Business Vocabulary",
                        description="Vocabular esential pentru vorbirea de afaceri in limba engleza",
                        content="""
                        BUSINESS ENGLISH VOCABULARY
                        
                        1. OFFICE VOCABULARY
                        - Office = birou
                        - Desk = birou (mobilier)
                        - Meeting = intalnire
                        - Conference = conferinta
                        - Presentation = prezentare
                        - Report = raport
                        - Deadline = termen limita
                        - Project = proiect
                        
                        2. BUSINESS COMMUNICATION
                        - Email = e-mail
                        - Memo = nota interna
                        - Letter = scrisoare
                        - Call = apel telefonic
                        - Conference call = conferinta telefonica
                        - Videoconference = videoconferinta
                        - Webinar = webinar
                        
                        3. FINANCIAL TERMS
                        - Budget = buget
                        - Profit = profit
                        - Loss = pierdere
                        - Revenue = venit
                        - Expense = cheltuiala
                        - Invoice = factura
                        - Payment = plata
                        - Account = cont
                        
                        4. COMPANY STRUCTURE
                        - CEO = Director General
                        - Manager = Manager
                        - Employee = Angajat
                        - Colleague = Coleg
                        - Department = Departament
                        - Team = Echipa
                        - Division = Divizie
                        
                        5. USEFUL BUSINESS PHRASES
                        - "Can you send me the report?" = "Poti sa-mi trimiti raportul?"
                        - "What is the deadline?" = "Care este termenul limita?"
                        - "Let's schedule a meeting" = "Sa programam o intalnire"
                        - "I'll follow up with you" = "Te voi contacta ulterior"
                        """,
                        subject="Engleza",
                        grade_level=10,
                        visibility=VisibilityType.PUBLIC,
                        is_shared=1,
                        professor_id=prof_elena_id,
                        created_at=datetime.utcnow()
                    )
                    session.add(material3)
                
                print("✅ Added 3 public materials for testing!")

        if created_any:
            session.commit()
            print("✅ Database seeded with test data successfully!")
            print(f"   - Professors: {len(professor_map)}")
            print(f"   - Students: {len(student_map)}")
            print(f"   - Quizzes created with mixed question types (single choice, multiple choice, free text)")
            print(f"   - Public materials for AI quiz generation testing")
    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
