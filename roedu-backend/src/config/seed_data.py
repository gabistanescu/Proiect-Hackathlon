from typing import List, Dict, Any

from sqlalchemy.orm import Session


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
    from src.services.auth_service import AuthService  # Local import to avoid circular dependency

    seed_data = _seed_definitions(UserRole, ProfileType)

    try:
        created_any = False
        for entry in seed_data:
            existing_user = session.query(User).filter(
                (User.email == entry["email"]) | (User.username == entry["username"])
            ).first()

            if existing_user:
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
            elif entry["role"] == UserRole.STUDENT:
                session.add(
                    Student(
                        id=user.id,
                        profile_type=entry.get("profile_type", ProfileType.UMAN),
                        grade_level=entry.get("grade_level"),
                        school_name=entry.get("school_name"),
                    )
                )

            created_any = True

        if created_any:
            session.commit()
    except Exception:
        session.rollback()
        raise
