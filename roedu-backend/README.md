# RoEdu Educational Platform - Backend

RoEdu este o platformă educațională colaborativă destinată liceelor din România, care oferă profesorilor și elevilor acces centralizat la materiale standardizate, organizate pe profiluri și materii. Prin funcții avansate de gestionare a conținutului, quiz-uri interactive, feedback, grupuri de lucru și inteligență artificială integrată, aplicația urmărește eliminarea diferențelor de învățare între elevi și sprijinirea unui parcurs educațional echitabil și modern.

## 🎯 Obiective

- **Adoptare în masă**: Platformă atractivă pentru licee să adopte standardizarea materialelor
- **Eliminarea diferențelor**: Elevii din liceele mai slabe să beneficieze de cele mai bune materiale
- **Viziune standardizată**: Reducerea diferențelor vizibile în funcție de profesor

## 👥 Roluri

### Administrator

- CRUD pentru profesori și baza de date din liceu
- Loguri și audit trail
- Schimbare parolă și gestionare securitate

### Profesor

- CRUD pe materiale de studiu (unul sau mai multe fișiere)
- Filtrare pe: profil (real, tehnologic, uman), materii, tag-uri
- Comentarii și întrebări (icon cu bec)
- Partajare materiale
- Search și Ask AI
- Salvare materiale
- Suport quiz-uri: automate, grile, single/multi choice
- Task-uri pentru revizuit anual
- Creare grupuri de studenți
- Refolosire quiz-uri (copiere)

### Student/Elev

- Doar cont cu mail de student/elev
- Salvare materiale
- Icon cu bec pentru întrebări
- Profil: Real, Tehnologic sau Uman
- Feedback pentru materiale (poate fi aprobat)
- Quiz-uri generate de AI

## 📋 Funcționalități Cheie

- **Profile educaționale**: Real, Tehnologic, Uman
- **Materiale cu tag-uri**: Clasa (9-12), opționale, materii
- **Quiz-uri interactive**: Single/Multiple choice, True/False
- **AI Integration**: Generare quiz-uri, răspunsuri la întrebări
- **Grupuri de studiu**: Organizare studenți pe grupuri
- **Sistem de comentarii**: Feedback și întrebări

## 🏗️ Structura Proiectului

```
roedu-backend/
├── src/
│   ├── main.py                    # Entry point
│   ├── config/
│   │   ├── database.py            # Database configuration
│   │   └── settings.py            # App settings
│   ├── models/                    # SQLAlchemy models
│   │   ├── user.py
│   │   ├── administrator.py
│   │   ├── professor.py
│   │   ├── student.py
│   │   ├── material.py
│   │   ├── quiz.py
│   │   ├── comment.py
│   │   └── group.py
│   ├── schemas/                   # Pydantic schemas
│   │   ├── user_schema.py
│   │   ├── material_schema.py
│   │   ├── quiz_schema.py
│   │   ├── comment_schema.py
│   │   └── group_schema.py
│   ├── api/v1/                    # API routes
│   │   ├── auth.py
│   │   ├── administrators.py
│   │   ├── professors.py
│   │   ├── students.py
│   │   ├── materials.py
│   │   ├── quizzes.py
│   │   └── comments.py
│   ├── services/                  # Business logic
│   │   ├── auth_service.py
│   │   ├── material_service.py
│   │   ├── quiz_service.py
│   │   ├── ai_service.py
│   │   └── email_service.py
│   ├── repositories/              # Data access layer
│   ├── middleware/                # Auth & logging middleware
│   └── utils/                     # Helper functions
├── tests/                         # Unit tests
├── migrations/                    # Database migrations
├── requirements.txt               # Dependencies
├── .env.example                   # Environment variables template
└── README.md

```

## 🚀 Instalare și Configurare

### Cerințe

- Python 3.9+
- pip

````

## 🚀 Instalare și Configurare

### Cerințe
- Python 3.9+
- pip

### Pași de instalare

1. **Clone repository:**
   ```powershell
   git clone <repository-url>
   cd roedu-backend
````

2. **Creează virtual environment:**

   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Instalează dependențele:**

   ```powershell
   pip install -r requirements.txt
   ```

4. **Configurează environment variables:**

   ```powershell
   copy .env.example .env
   ```

   Editează `.env` cu configurările tale (SECRET_KEY, DATABASE_URL, OPENAI_API_KEY, etc.)

5. **Rulează aplicația:**

   ```powershell
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Accesează documentația API:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 🔧 Configurare

### Variabile de Mediu (.env)

```env
# Database
DATABASE_URL=sqlite:///./roedu.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@roedu.com

# AI
AI_ENABLED=true
OPENAI_API_KEY=your-openai-api-key

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Autentificare utilizator
- `GET /api/v1/auth/me` - Informații despre utilizatorul curent
- `GET /api/v1/auth/verify` - Verifică validitatea token-ului

### Administrators

- `GET /api/v1/administrators` - Listează administratorii existenți
- `POST /api/v1/administrators/users/administrators` - Creează un cont de administrator (doar admin)
- `POST /api/v1/administrators/users/professors` - Creează un cont de profesor (doar admin)
- `POST /api/v1/administrators/users/students` - Creează un cont de elev (doar admin)
- `PUT /api/v1/administrators/{id}` - Actualizează datele unui administrator
- `DELETE /api/v1/administrators/{id}` - Șterge un administrator

### Professors

- `GET /api/v1/professors` - List all professors
- `POST /api/v1/professors` - Create professor
- `GET /api/v1/professors/{id}` - Get professor details
- `PUT /api/v1/professors/{id}` - Update professor
- `DELETE /api/v1/professors/{id}` - Delete professor

### Students

- `GET /api/v1/students` - List all students
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/{id}` - Get student details
- `PUT /api/v1/students/{id}` - Update student
- `GET /api/v1/students/{id}/saved-materials` - Get saved materials

### Materials

- `GET /api/v1/materials` - List materials (with filters)
- `POST /api/v1/materials` - Create material (professors only)
- `GET /api/v1/materials/{id}` - Get material details
- `PUT /api/v1/materials/{id}` - Update material
- `DELETE /api/v1/materials/{id}` - Delete material
- `POST /api/v1/materials/{id}/save` - Save material (students)
- `POST /api/v1/materials/search` - Search materials
- `POST /api/v1/materials/upload` - Upload files

### Quizzes

- `GET /api/v1/quizzes` - List quizzes
- `POST /api/v1/quizzes` - Create quiz (professors only)
- `GET /api/v1/quizzes/{id}` - Get quiz details
- `PUT /api/v1/quizzes/{id}` - Update quiz
- `DELETE /api/v1/quizzes/{id}` - Delete quiz
- `POST /api/v1/quizzes/{id}/copy` - Copy quiz
- `POST /api/v1/quizzes/{id}/attempt` - Submit quiz attempt (students)
- `GET /api/v1/quizzes/{id}/results` - Get quiz results
- `POST /api/v1/quizzes/generate-ai` - Generate quiz with AI

### Comments

- `GET /api/v1/comments` - List comments
- `POST /api/v1/comments` - Create comment
- `PUT /api/v1/comments/{id}` - Update comment
- `DELETE /api/v1/comments/{id}` - Delete comment
- `PUT /api/v1/comments/{id}/approve` - Approve comment (professors)

### Groups (Professors)

- `GET /api/v1/professors/groups` - List professor's groups
- `POST /api/v1/professors/groups` - Create group
- `PUT /api/v1/professors/groups/{id}` - Update group
- `DELETE /api/v1/professors/groups/{id}` - Delete group
- `POST /api/v1/professors/groups/{id}/students` - Add students to group
- `DELETE /api/v1/professors/groups/{id}/students` - Remove students from group

## 🧪 Testing

```powershell
# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test file
pytest tests/test_auth.py
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM

## 📦 Database Models

### User Roles

- **Administrator**: Manages professors and school database
- **Professor**: Creates materials, quizzes, and manages groups
- **Student**: Accesses materials, takes quizzes, provides feedback

### Key Models

- **User**: Base user with authentication
- **Material**: Educational materials with files, tags, and metadata
- **Quiz**: Interactive quizzes with questions
- **Question**: Quiz questions (single/multiple choice, true/false)
- **Comment**: Feedback and questions on materials
- **Group**: Student groups created by professors

## 🤖 AI Features

- **Quiz Generation**: Generate quiz questions using OpenAI GPT
- **Question Answering**: AI-powered answers to student questions
- **Content Recommendations**: Intelligent material suggestions

## 🌐 Frontend Integration

Backend-ul este pregătit pentru integrare cu Angular frontend:

- CORS configurat pentru development și production
- RESTful API design
- JSON responses
- File upload support
- WebSocket ready (pentru notificări viitoare)

## 📝 License

MIT License

## 👨‍💻 Development

Pentru development local:

```powershell
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn src.main:app --reload

# Format code
black src/

# Lint
flake8 src/
```

## 🚀 Production Deployment

1. Set environment to production
2. Use PostgreSQL instead of SQLite
3. Configure proper CORS origins
4. Use environment variables for secrets
5. Enable HTTPS
6. Set up proper logging
7. Use gunicorn or similar WSGI server

```powershell
gunicorn src.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📞 Support

Pentru întrebări și suport, contactați echipa de dezvoltare.

---

**RoEdu Educational Platform** - Educație modernă și echitabilă pentru toți elevii din România 🇷🇴

4. Set up the environment variables by copying `.env.example` to `.env` and updating the values as needed.

## Running the Application

To start the application, run:

```
uvicorn src.main:app --reload
```

## Testing

To run the tests, use:

```
pytest
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
