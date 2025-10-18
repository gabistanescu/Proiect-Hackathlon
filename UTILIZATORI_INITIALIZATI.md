# 👥 Utilizatori Inițializați - Platforma RoEdu

## 📋 Informații Generale

Platforma RoEdu folosește un sistem de autentificare **închis**. Nu există înregistrare publică - toate conturile sunt create și gestionate de administratori.

## 🔐 Conturi Demo Disponibile

### 👨‍💼 Administrator

- **Username**: `admin`
- **Email**: `admin@roedu.ro`
- **Parolă**: `Admin123!`
- **Școală**: Colegiul National Bucuresti
- **Telefon**: 0712345678

---

### 👨‍🏫 Profesori

#### 1. Profesor Ana Popescu

- **Username**: `prof.ana`
- **Email**: `ana.popescu@roedu.ro`
- **Parolă**: `Prof1234!`
- **Departament**: Matematica
- **Materii**: Algebra, Geometrie
- **Telefon**: 0720123456

#### 2. Profesor Mihai Ionescu

- **Username**: `prof.mihai`
- **Email**: `mihai.ionescu@roedu.ro`
- **Parolă**: `Prof1234!`
- **Departament**: Informatica
- **Materii**: Programare, Algoritmi
- **Telefon**: 0720456123

#### 3. Profesor Elena Marinescu

- **Username**: `prof.elena`
- **Email**: `elena.marinescu@roedu.ro`
- **Parolă**: `Prof1234!`
- **Departament**: Limbi Moderne
- **Materii**: Engleza, Franceza
- **Telefon**: 0720789456

#### 4. Profesor Ion Dumitru

- **Username**: `prof.ion`
- **Email**: `ion.dumitru@roedu.ro`
- **Parolă**: `Prof1234!`
- **Departament**: Istorie si Stiinte Sociale
- **Materii**: Istorie, Geografie
- **Telefon**: 0720567890

---

### 👨‍🎓 Elevi

#### 1. Andrei Pop

- **Username**: `student01`
- **Email**: `andrei.pop@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: REAL
- **Clasa**: 9
- **Școală**: Colegiul National Bucuresti

#### 2. Bianca Ilie

- **Username**: `student02`
- **Email**: `bianca.ilie@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: UMAN
- **Clasa**: 10
- **Școală**: Colegiul National Bucuresti

#### 3. Catalin Stoica

- **Username**: `student03`
- **Email**: `catalin.stoica@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: TEHNOLOGIC
- **Clasa**: 11
- **Școală**: Colegiul Tehnic Energetic

#### 4. Daniela Radu

- **Username**: `student04`
- **Email**: `daniela.radu@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: REAL
- **Clasa**: 12
- **Școală**: Liceul Teoretic Mihai Eminescu

#### 5. Emanuel Marin

- **Username**: `student05`
- **Email**: `emanuel.marin@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: UMAN
- **Clasa**: 9
- **Școală**: Liceul Teoretic Mihai Eminescu

#### 6. Florentina Dinu

- **Username**: `student06`
- **Email**: `florentina.dinu@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: TEHNOLOGIC
- **Clasa**: 10
- **Școală**: Colegiul Tehnic Energetic

#### 7. George Petrescu

- **Username**: `student07`
- **Email**: `george.petrescu@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: REAL
- **Clasa**: 11
- **Școală**: Colegiul National Bucuresti

#### 8. Hortensia Neagu

- **Username**: `student08`
- **Email**: `hortensia.neagu@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: UMAN
- **Clasa**: 12
- **Școală**: Liceul Teoretic Mihai Eminescu

#### 9. Ioan Vasile

- **Username**: `student09`
- **Email**: `ioan.vasile@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: TEHNOLOGIC
- **Clasa**: 9
- **Școală**: Colegiul Tehnic Energetic

#### 10. Julia Matei

- **Username**: `student10`
- **Email**: `julia.matei@roedu.ro`
- **Parolă**: `Stud1234!`
- **Profil**: REAL
- **Clasa**: 10
- **Școală**: Colegiul National Bucuresti

---

## 🔒 Securitate și Acces

### Pentru Testare și Demo

Utilizează conturile de mai sus pentru a testa funcționalitățile platformei.

### Pentru Producție

În mediul de producție:

- ✅ Administratorii de școli primesc conturi de la echipa RoEdu
- ✅ Administratorii creează conturi pentru profesori și elevi
- ❌ Nu există înregistrare publică
- ❌ Formularul de register afișează doar mesaj informativ

---

## 📝 Cum Funcționează Sistemul?

### 1. Inițializare Backend

Când backend-ul pornește pentru prima dată:

- Fișierul `src/config/seed_data.py` conține lista de utilizatori
- Funcția `seed_initial_data()` verifică și creează utilizatorii dacă nu există
- Parolele sunt hash-ate automat folosind bcrypt

### 2. Autentificare Frontend

- Utilizatorii se conectează cu email + parolă
- Nu există opțiune de înregistrare funcțională
- Pagina `/register` afișează un mesaj informativ

### 3. Gestionare Utilizatori

- Doar administratorii pot crea conturi noi
- Se folosește endpoint-ul `/api/v1/administrators/create-professor` sau `create-student`
- Fiecare cont nou primește credențiale generate

---

## 🚀 Cum să Resetezi Datele

Dacă vrei să resetezi baza de date la starea inițială:

```bash
cd roedu-backend
python reset_data.py
```

Acest script va:

- Șterge toate datele existente
- Recrea tabelele
- Reinițializa utilizatorii din `seed_data.py`

---

## 📧 Contact și Suport

Pentru orice întrebări sau probleme legate de accesul la platformă:

- **Email suport**: admin@roedu.ro
- **Administratori școlii**: Contactează administratorul școlii tale

---

## ⚠️ Note Importante

1. **Parolele Demo**: Parolele de mai sus sunt doar pentru demonstrație și testare
2. **Producție**: În producție, asigură-te că modifici toate parolele implicite
3. **Backup**: Creează backup-uri regulate ale bazei de date
4. **Securitate**: Nu partaja credențialele administrative în locuri publice

---

**Versiune document**: 1.0  
**Ultima actualizare**: Octombrie 2025
