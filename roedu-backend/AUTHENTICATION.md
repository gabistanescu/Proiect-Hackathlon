# 🔐 Sistem de Autentificare - RoEdu Backend

## 📋 Prezentare Generală

Backend-ul RoEdu implementează un sistem de autentificare **închis** fără înregistrare publică.

## 🚫 Fără Register Public

**Nu există endpoint public de înregistrare!**

- ❌ `/api/v1/auth/register` - NU EXISTĂ
- ❌ `/api/v1/auth/signup` - NU EXISTĂ
- ✅ `/api/v1/auth/login` - Doar autentificare

## ✅ Endpoint-uri Disponibile

### Autentificare

```
POST /api/v1/auth/login
POST /api/v1/auth/login/token (pentru Swagger UI)
GET  /api/v1/auth/me
GET  /api/v1/auth/verify
```

### Creare Utilizatori (doar pentru ADMINISTRATORI)

```
POST /api/v1/administrators/create-professor
POST /api/v1/administrators/create-student
```

## 🔧 Inițializare Utilizatori

### Seed Data Automat

La pornirea backend-ului, sistemul verifică și creează automat utilizatorii inițiali dacă nu există:

**Fișier**: `src/config/seed_data.py`

**Funcție**: `seed_initial_data(session: Session)`

**Apelat în**: `src/config/database.py` → `init_db()`

### Utilizatori Creați Automat

#### 1 Administrator

- admin@roedu.ro / Admin123!

#### 4 Profesori

- ana.popescu@roedu.ro / Prof1234!
- mihai.ionescu@roedu.ro / Prof1234!
- elena.marinescu@roedu.ro / Prof1234!
- ion.dumitru@roedu.ro / Prof1234!

#### 10 Elevi

- andrei.pop@roedu.ro / Stud1234!
- bianca.ilie@roedu.ro / Stud1234!
- catalin.stoica@roedu.ro / Stud1234!
- daniela.radu@roedu.ro / Stud1234!
- emanuel.marin@roedu.ro / Stud1234!
- florentina.dinu@roedu.ro / Stud1234!
- george.petrescu@roedu.ro / Stud1234!
- hortensia.neagu@roedu.ro / Stud1234!
- ioan.vasile@roedu.ro / Stud1234!
- julia.matei@roedu.ro / Stud1234!

## 🔄 Verificare și Reset

### Verificare Baza de Date

```bash
python check_db.py
```

### Reset Complet

```bash
python reset_data.py
```

Acest script va:

1. Șterge toate tabelele
2. Recrea structura bazei de date
3. Inițializa utilizatorii din seed_data.py

## 🛡️ Securitate

### Protecție Endpoint-uri

Doar administratorii pot crea noi utilizatori:

```python
# src/api/v1/administrators.py

@router.post("/create-professor")
def create_professor(
    professor_data: CreateProfessorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # ← Verificare rol
):
    # ...
```

### Hash Parole

Toate parolele sunt hash-ate cu bcrypt:

```python
# src/services/auth_service.py

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@staticmethod
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

## 📝 Flux de Lucru

### 1. Pornire Aplicație

```bash
cd roedu-backend
run.bat  # sau: uvicorn src.main:app --reload
```

### 2. Inițializare Automată

```
Starting up RoEdu Educational Platform...
Database initialized successfully!
```

### 3. Verificare Utilizatori

```bash
python check_db.py
```

Output așteptat:

```
=== USERS ===
admin | admin@roedu.ro | ADMINISTRATOR
prof.ana | ana.popescu@roedu.ro | PROFESSOR
...
Total: 15 users
```

### 4. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roedu.ro", "password": "Admin123!"}'
```

Response:

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

## 🔍 Debugging

### Verificare Dacă Utilizatorii Există

```python
# check_db.py
from src.config.database import SessionLocal
from src.models.user import User

db = SessionLocal()
users = db.query(User).all()
for user in users:
    print(f"{user.username} | {user.email} | {user.role}")
```

### Forțare Re-seed

Dacă vrei să forțezi recrearea utilizatorilor:

```bash
# Șterge baza de date
rm instance/roedu.db

# Repornește backend-ul
uvicorn src.main:app --reload
```

## 🚨 Troubleshooting

### Problema: "User already exists"

**Soluție**: Utilizatorii sunt deja în baza de date. Folosește `check_db.py` pentru verificare.

### Problema: "No users found"

**Soluție**: Rulează `reset_data.py` pentru a reinițializa baza de date.

### Problema: "Login failed"

**Verificări**:

1. Email-ul este corect?
2. Parola este corectă?
3. Utilizatorul există în baza de date?
4. Utilizatorul are `is_active = 1`?

```bash
# Verificare rapidă
python -c "from src.config.database import SessionLocal; from src.models.user import User; db = SessionLocal(); user = db.query(User).filter(User.email == 'admin@roedu.ro').first(); print(f'User: {user.username}, Active: {user.is_active}')"
```

## 📚 Referințe

- **Seed Data**: `src/config/seed_data.py`
- **Auth Routes**: `src/api/v1/auth.py`
- **Admin Routes**: `src/api/v1/administrators.py`
- **Auth Service**: `src/services/auth_service.py`
- **Database Init**: `src/config/database.py`

---

**Important**: În producție, asigură-te că modifici toate parolele implicite!
