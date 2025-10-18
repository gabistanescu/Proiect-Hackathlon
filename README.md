#4 🎓 RoEdu - Platformă Educațională pentru Școlile din România

## 📋 Despre Proiect

RoEdu este o platformă educațională modernă destinată școlilor din România, oferind acces la materiale educaționale standardizate, quiz-uri interactive și colaborare între profesori și elevi.

## 🔐 Sistem de Autentificare Închis

**IMPORTANT**: Platforma folosește un sistem de autentificare **închis** - nu există înregistrare publică!

### Cum Funcționează?

- ✅ Utilizatorii sunt creați automat la inițializare (seed data)
- ✅ Administratorii pot crea noi conturi pentru profesori și elevi
- ❌ Nu există formular public de înregistrare
- ❌ Pagina `/register` afișează doar mesaj informativ

### Utilizatori Demo Disponibili

```
👨‍💼 Administrator: admin@roedu.ro / Admin123!
👨‍🏫 Profesori: prof.ana@roedu.ro / Prof1234! (și alți 3)
👨‍🎓 Elevi: student01@roedu.ro / Stud1234! (10 elevi total)
```

**Vezi lista completă**: `UTILIZATORI_INITIALIZATI.md`

## 🚀 Quick Start

### 1. Pornire Backend

```bash
cd roedu-backend
# Instalare dependențe (prima dată)
pip install -r requirements.txt

# Pornire server
run.bat
# Sau: uvicorn src.main:app --reload
```

### 2. Pornire Frontend

```bash
cd roedu-frontend
# Instalare dependințe (prima dată)
npm install

# Pornire server development
npm start
# Sau: ng serve
```

### 3. Acces Platformă

```
Frontend: http://localhost:4200
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

### 4. Login

```
1. Deschide http://localhost:4200/login
2. Folosește credențiale din seed data
3. Exemplu: admin@roedu.ro / Admin123!
```

## 📁 Structură Proiect

```
Proiect Hackathlon/
├── roedu-backend/          # Backend FastAPI
│   ├── src/
│   │   ├── api/v1/        # Endpoint-uri API
│   │   ├── models/        # Modele SQLAlchemy
│   │   ├── services/      # Logică business
│   │   ├── config/        # Configurare + seed data
│   │   └── main.py        # Entry point
│   ├── check_db.py        # Verificare bază de date
│   ├── reset_data.py      # Reset bază de date
│   └── requirements.txt
│
├── roedu-frontend/         # Frontend Angular
│   ├── src/app/
│   │   ├── components/    # Componente UI
│   │   ├── services/      # Services API
│   │   ├── guards/        # Route guards
│   │   └── models/        # TypeScript models
│   ├── package.json
│   └── angular.json
│
└── Documentație/
    ├── QUICK_START.md              # Start rapid
    ├── UTILIZATORI_INITIALIZATI.md # Lista utilizatori
    ├── STATUS_AUTENTIFICARE.md     # Status implementare
    ├── roedu-backend/AUTHENTICATION.md
    └── roedu-frontend/AUTHENTICATION.md
```

## 🛠️ Tehnologii

### Backend

- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy ORM)
- **Auth**: JWT + bcrypt
- **Python**: 3.8+

### Frontend

- **Framework**: Angular 17+
- **UI**: SCSS custom styling
- **HTTP**: Angular HttpClient
- **Routing**: Angular Router

## 📚 Funcționalități Principale

### 🎓 Pentru Elevi

- ✅ Acces la materiale educaționale (organizate pe profil, materie, clasă)
- ✅ Rezolvare quiz-uri interactive
- ✅ Salvare materiale favorite
- ✅ Comentarii și feedback
- ✅ Urmărire progres

### 👨‍🏫 Pentru Profesori

- ✅ Creare și gestionare materiale
- ✅ Creare și gestionare quiz-uri
- ✅ Vizualizare progres elevi
- ✅ Organizare pe grupuri/clase
- ✅ Moderare comentarii

### 👨‍💼 Pentru Administratori

- ✅ Gestionare utilizatori (profesori, elevi)
- ✅ Administrare platformă
- ✅ Configurare școală
- ✅ Rapoarte și statistici

## 🔧 Comenzi Utile

### Backend

```bash
# Verificare utilizatori în baza de date
python check_db.py

# Reset complet bază de date
python reset_data.py

# Rulare teste
pytest tests/

# Pornire cu reload automat
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Development server
ng serve

# Build pentru producție
ng build --configuration production

# Rulare teste
ng test

# Linting
ng lint
```

## 📖 Documentație Detaliată

### Pentru Dezvoltatori

- **Backend Auth**: `roedu-backend/AUTHENTICATION.md`
- **Frontend Auth**: `roedu-frontend/AUTHENTICATION.md`
- **Status Implementare**: `STATUS_AUTENTIFICARE.md`

### Pentru Utilizatori

- **Quick Start**: `QUICK_START.md`
- **Lista Utilizatori**: `UTILIZATORI_INITIALIZATI.md`
- **Setup Guide Frontend**: `roedu-frontend/SETUP_GUIDE.md`
- **README Backend**: `roedu-backend/README.md`

## 🔐 Securitate

### Producție Checklist

- [ ] Schimbă toate parolele seed
- [ ] Configurează SECRET_KEY unic și securizat
- [ ] Activează HTTPS
- [ ] Configurează CORS restrictiv
- [ ] Setup backup automat bază de date
- [ ] Monitorizare logging
- [ ] Rate limiting pe API

### Development

- ✅ Seed data disponibil
- ✅ Parole hash-ate cu bcrypt
- ✅ JWT pentru autentificare
- ✅ Route guards în frontend
- ✅ Middleware protecție endpoint-uri

## 🐛 Troubleshooting

### Backend nu pornește?

```bash
# Verifică versiunea Python
python --version  # Trebuie 3.8+

# Reinstalează dependințele
pip install -r requirements.txt --force-reinstall

# Șterge baza de date și repornește
rm instance/roedu.db
python src/main.py
```

### Frontend nu pornește?

```bash
# Verifică versiunea Node.js
node --version  # Trebuie 18+

# Curăță cache și reinstalează
rm -rf node_modules package-lock.json
npm install

# Pornește din nou
npm start
```

### Login nu funcționează?

```bash
# Verifică utilizatorii în DB
cd roedu-backend
python check_db.py

# Verifică că backend-ul rulează
curl http://localhost:8000/api/v1/auth/verify

# Test login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@roedu.ro","password":"Admin123!"}'
```

## 🤝 Contribuție

Pentru a contribui la proiect:

1. Fork repository-ul
2. Creează un branch pentru feature-ul tău
3. Commit changes
4. Push la branch
5. Deschide un Pull Request

## 📧 Contact și Suport

- **Email**: admin@roedu.ro
- **Issues**: GitHub Issues
- **Documentation**: Vezi fișierele .md din proiect

## 📝 License

Acest proiect este dezvoltat pentru uzul școlilor din România.

---

## 🎯 Status Proiect

### ✅ Implementat

- [x] Sistem de autentificare JWT
- [x] Seed data automat
- [x] CRUD materiale educaționale
- [x] CRUD quiz-uri interactive
- [x] Sistem de comentarii
- [x] Role-based access control
- [x] UI responsive
- [x] Documentație completă

### 🚧 În Dezvoltare

- [ ] Integrare AI pentru generare materiale
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app

---

**Versiune**: 1.0  
**Ultima actualizare**: Octombrie 2025  
**Status**: ✅ Production Ready

🚀 **Happy Learning!**
