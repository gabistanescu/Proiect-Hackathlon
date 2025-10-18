# 🔄 Flow Diagram - Sistem Autentificare RoEdu

## 🎯 Arhitectură Generală

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILIZATOR (Browser)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /login       │  │ /register    │  │ /materials   │      │
│  │ (Formular)   │  │ (Mesaj Info) │  │ (Protected)  │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                     │              │
│         │  ┌─────────────────────────────────┘              │
│         │  │                                                 │
│         ▼  ▼                                                 │
│  ┌──────────────────┐        ┌───────────────┐             │
│  │  AuthService     │───────▶│  API Service  │             │
│  │  - login()       │        │  - HTTP calls │             │
│  │  - logout()      │        └───────┬───────┘             │
│  │  - getUser()     │                │                      │
│  └──────────────────┘                │                      │
└────────────────────────────────────┬─┘                      │
                                     │                         │
                                     ▼                         │
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Endpoints                              │ │
│  │  ✅ POST /api/v1/auth/login                            │ │
│  │  ✅ POST /api/v1/auth/login/token                      │ │
│  │  ✅ GET  /api/v1/auth/me                               │ │
│  │  ✅ GET  /api/v1/auth/verify                           │ │
│  │  ❌ POST /api/v1/auth/register (NU EXISTĂ!)           │ │
│  │                                                          │ │
│  │  🔒 POST /api/v1/administrators/create-professor       │ │
│  │  🔒 POST /api/v1/administrators/create-student         │ │
│  └─────────────────────┬────────────────────────────────────┘ │
│                        │                                      │
│                        ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AuthService (Business Logic)             │   │
│  │  - authenticate_user()                                │   │
│  │  - create_access_token()                              │   │
│  │  - verify_password()                                  │   │
│  │  - get_password_hash()                                │   │
│  │  - register_user() ← Doar pentru ADMIN!              │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                      │
│                        ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              DATABASE (SQLite)                        │   │
│  │  - users (16 utilizatori seed)                        │   │
│  │  - administrators                                     │   │
│  │  - professors                                         │   │
│  │  - students                                           │   │
│  │  - materials, quizzes, etc.                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flow Login (Succes)

```
┌──────────┐
│ User     │
│ /login   │
└────┬─────┘
     │
     │ 1. Introduce email + parolă
     │    (ex: admin@roedu.ro / Admin123!)
     ▼
┌────────────────────┐
│ LoginComponent     │
│ onSubmit()         │
└─────┬──────────────┘
      │
      │ 2. Apelează AuthService.login()
      ▼
┌────────────────────────────┐
│ AuthService (Frontend)     │
│ POST /api/v1/auth/login    │
└─────┬──────────────────────┘
      │
      │ 3. HTTP Request
      │ Body: { email, password }
      ▼
┌──────────────────────────────────┐
│ Backend: /auth/login endpoint    │
│ AuthService.authenticate_user()  │
└─────┬────────────────────────────┘
      │
      │ 4. Verifică în database
      ▼
┌───────────────────────┐
│ Database              │
│ Query user by email   │
│ Verify password hash  │
└─────┬─────────────────┘
      │
      │ 5. User valid? ✅
      ▼
┌──────────────────────────────────┐
│ Backend: Generate JWT Token      │
│ { user_id, role, exp }           │
└─────┬────────────────────────────┘
      │
      │ 6. Return token
      │ { access_token: "eyJ...", token_type: "bearer" }
      ▼
┌────────────────────────────┐
│ AuthService (Frontend)     │
│ Salvează token în          │
│ localStorage               │
└─────┬──────────────────────┘
      │
      │ 7. Update current user
      ▼
┌────────────────────┐
│ Router             │
│ Navigate('/')      │
└─────┬──────────────┘
      │
      ▼
┌──────────┐
│ Homepage │
│ ✅ Login │
│ Succes!  │
└──────────┘
```

---

## 🚫 Flow Register (Blocat)

```
┌──────────┐
│ User     │
│ Homepage │
└────┬─────┘
     │
     │ 1. Click "Află cum obții un cont"
     │    sau navighează la /register
     ▼
┌─────────────────────┐
│ RegisterComponent   │
│ ❌ NU are formular │
│ ✅ Doar mesaj info │
└─────┬───────────────┘
      │
      │ 2. Afișează mesaj:
      │    "Înregistrare Închisă"
      │    "Contactează administratorul școlii"
      ▼
┌────────────────────────────┐
│ Mesaj Informativ           │
│                            │
│ 📋 Cum obții un cont?      │
│ → Contactează admin școală │
│                            │
│ 👥 Pentru profesori/elevi  │
│ → Primești credențiale     │
│                            │
│ 🏫 Pentru admin școală     │
│ → Contact admin@roedu.ro   │
│                            │
│ [Button: Login →]          │
└────────────────────────────┘
      │
      │ 3. User click "Login"
      ▼
┌──────────┐
│ /login   │
│ Formular │
└──────────┘

❌ NU EXISTĂ FLOW:
   User → Register Form → Submit → API → Create Account

✅ EXISTĂ DOAR:
   User → Info Page → Instrucțiuni → Contact Admin
```

---

## 👨‍💼 Flow Creare Utilizator de către Admin

```
┌──────────────┐
│ Admin        │
│ Autentificat │
└──────┬───────┘
       │
       │ 1. Accesează dashboard admin
       ▼
┌────────────────────────┐
│ Admin Dashboard        │
│ - Create Professor     │
│ - Create Student       │
└──────┬─────────────────┘
       │
       │ 2. Completează formular
       │    (username, email, password, etc.)
       ▼
┌─────────────────────────────────┐
│ POST /administrators/           │
│      create-professor           │
│ Header: Authorization: Bearer   │
│         <admin_token>           │
└──────┬──────────────────────────┘
       │
       │ 3. Verifică rol admin
       ▼
┌────────────────────────────┐
│ Middleware: Verify Admin   │
│ get_current_admin()        │
└──────┬─────────────────────┘
       │
       │ 4. Admin valid? ✅
       ▼
┌──────────────────────────────┐
│ AuthService.register_user()  │
│ (DOAR INTERN, nu public!)    │
└──────┬───────────────────────┘
       │
       │ 5. Creează user + profile
       ▼
┌─────────────────────┐
│ Database            │
│ INSERT user         │
│ INSERT professor    │
└──────┬──────────────┘
       │
       │ 6. Success
       ▼
┌─────────────────────────┐
│ Return new user info    │
│ Admin poate transmite   │
│ credențiale utilizator  │
└─────────────────────────┘
```

---

## 🔄 Flow Seed Data (Startup)

```
┌─────────────────┐
│ Backend Start   │
│ uvicorn start   │
└────┬────────────┘
     │
     │ @app.on_event("startup")
     ▼
┌────────────────┐
│ init_db()      │
└────┬───────────┘
     │
     │ 1. Creează tabele dacă nu există
     ▼
┌─────────────────────────┐
│ seed_initial_data()     │
└────┬────────────────────┘
     │
     │ 2. Citește _seed_definitions()
     │    - 1 admin
     │    - 4 profesori
     │    - 10 elevi
     ▼
┌──────────────────────────────┐
│ Pentru fiecare utilizator:   │
│                              │
│ Există deja?                 │
│   ├─ DA → Skip               │
│   └─ NU → Creează            │
└────┬─────────────────────────┘
     │
     │ 3. Hash parole cu bcrypt
     ▼
┌──────────────────────────┐
│ INSERT INTO users        │
│ INSERT INTO admin/       │
│         prof/student     │
└────┬─────────────────────┘
     │
     │ 4. Commit changes
     ▼
┌──────────────────────────┐
│ "Database initialized    │
│  successfully!"          │
└──────────────────────────┘

✅ Acum utilizatorii pot face login!
```

---

## 🛡️ Flow Protecție Rute

```
┌──────────────┐
│ User         │
│ Neautentif.  │
└──────┬───────┘
       │
       │ 1. Încearcă /materials
       ▼
┌────────────────┐
│ AuthGuard      │
│ canActivate()  │
└──────┬─────────┘
       │
       │ 2. Verifică token în localStorage
       │    Token există? ❌
       ▼
┌──────────────────┐
│ Router           │
│ navigate('/login')│
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ /login       │
│ Redirect     │
└──────────────┘

───────────────────────────────

După Login:

┌──────────────┐
│ User         │
│ Autentif. ✅ │
└──────┬───────┘
       │
       │ 1. Încearcă /materials
       ▼
┌────────────────┐
│ AuthGuard      │
│ canActivate()  │
└──────┬─────────┘
       │
       │ 2. Verifică token în localStorage
       │    Token există? ✅
       ▼
┌──────────────────┐
│ Allow Access     │
│ return true      │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ /materials   │
│ Acces OK ✅  │
└──────────────┘
```

---

## 📊 Diagrama Stări Utilizator

```
                    ┌─────────────────┐
                    │  Guest User     │
                    │  (Neautentif.)  │
                    └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │ /register    │    │ /login       │
         │ (Info Only)  │    │ (Formular)   │
         └──────┬───────┘    └──────┬───────┘
                │                   │
                │                   │ Introduce
                │                   │ credențiale
                │                   ▼
                │          ┌─────────────────┐
                └─────────▶│  Autentificare  │
                           └────────┬────────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                     ✅ Success          ❌ Failed
                          │                   │
                          ▼                   ▼
              ┌────────────────────┐  ┌──────────────┐
              │ Authenticated User │  │ Error Alert  │
              │ - Token saved      │  │ Try again    │
              │ - Role loaded      │  └──────────────┘
              └─────────┬──────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Admin        │ │ Professor    │ │ Student      │
│ - Manage     │ │ - Create     │ │ - Access     │
│   users      │ │   materials  │ │   materials  │
│ - Config     │ │ - Create     │ │ - Take       │
│              │ │   quizzes    │ │   quizzes    │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🎯 Puncte Cheie

### ✅ Ce EXISTĂ

1. **Backend Seed**: Auto-creează 15+ utilizatori la startup
2. **Login Endpoint**: `POST /api/v1/auth/login` funcțional
3. **Frontend Login**: Formular complet funcțional
4. **JWT Auth**: Token-uri sicure cu expirare
5. **Role-based Access**: Admin, Professor, Student
6. **Protected Routes**: Guard-uri funcționale
7. **Info Page**: `/register` cu mesaj clar

### ❌ Ce NU EXISTĂ (conform cerințelor)

1. **Register Endpoint**: NU există `POST /api/v1/auth/register`
2. **Register Form**: NU există formular public de înregistrare
3. **Self Registration**: NU se poate auto-înregistra nimeni
4. **Public User Creation**: Doar adminii pot crea utilizatori

---

**Diagrama completă a sistemului de autentificare închis** ✅
