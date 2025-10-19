# 🔐 Quick Reference - Autentificare RoEdu

## ⚡ Utilizatori Demo - Acces Rapid

### 👨‍💼 Administrator

```
Email: admin@roedu.ro
Parolă: Admin123!
```

### 👨‍🏫 Profesori

```
Email: ana.popescu@roedu.ro    | Parolă: Prof1234!
Email: mihai.ionescu@roedu.ro  | Parolă: Prof1234!
Email: elena.marinescu@roedu.ro| Parolă: Prof1234!
Email: ion.dumitru@roedu.ro    | Parolă: Prof1234!
```

### 👨‍🎓 Elevi

```
Email: andrei.pop@roedu.ro     | Parolă: Stud1234!
Email: bianca.ilie@roedu.ro    | Parolă: Stud1234!
Email: catalin.stoica@roedu.ro | Parolă: Stud1234!
Email: daniela.radu@roedu.ro   | Parolă: Stud1234!
...și alți 6 elevi (student05-student10)
```

---

## 🚀 Comenzi Rapide

### Verificare Utilizatori

```bash
cd roedu-backend
python check_db.py
```

### Reset Bază de Date

```bash
cd roedu-backend
python reset_data.py
```

### Pornire Backend

```bash
cd roedu-backend
run.bat
# Sau: uvicorn src.main:app --reload
```

### Pornire Frontend

```bash
cd roedu-frontend
npm start
# Sau: ng serve
```

---

## 📄 Pagini Frontend

### Login (Funcțional)

```
URL: http://localhost:4200/login
Tip: Formular complet funcțional
Action: Login cu credențiale
```

### Register (Informativ)

```
URL: http://localhost:4200/register
Tip: Mesaj informativ
Action: Afișează instrucțiuni (fără formular!)
```

---

## ✅ Verificări Rapide

### Backend

- [ ] Pornește fără erori?
- [ ] "Database initialized successfully!" ?
- [ ] `check_db.py` arată 16 utilizatori?
- [ ] Login funcționează: `curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@roedu.ro","password":"Admin123!"}'`

### Frontend

- [ ] Pornește fără erori?
- [ ] `/login` afișează formular?
- [ ] `/register` afișează mesaj (NU formular)?
- [ ] Login cu admin@roedu.ro funcționează?

---

## 📚 Documentație Completă

Citește documentele pentru detalii:

- `UTILIZATORI_INITIALIZATI.md` - Lista completă utilizatori
- `STATUS_AUTENTIFICARE.md` - Status implementare
- `roedu-backend/AUTHENTICATION.md` - Detalii backend
- `roedu-frontend/AUTHENTICATION.md` - Detalii frontend

---

## 🎯 Reminder Important

### ✅ CE FUNCȚIONEAZĂ

- Login cu credențiale seed
- Auto-inițializare utilizatori
- Pagină informativă pentru register

### ❌ CE NU EXISTĂ (conform cerințelor)

- Formular public de înregistrare
- Endpoint public /auth/register
- Posibilitate de auto-înregistrare

---

**Tot ce ai nevoie pentru a începe!** 🚀
