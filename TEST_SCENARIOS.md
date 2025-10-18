# 📋 Scenarii de Testare - Sistem Advanced Materials

## ✅ Status Servere

- **Backend**: http://localhost:8000 ✅ RUNNING
- **Frontend**: http://localhost:4200 ✅ RUNNING

## 👥 Conturi de Test

### Profesori

- **Prof. Ana Popescu**: ana.popescu@roedu.ro / parola123
- **Prof. Mihai Ionescu**: mihai.ionescu@roedu.ro / parola123

### Studenți

- **Student**: student01@roedu.ro / parola123

---

## 🎯 Scenario 1: Vizibilitate Materiale

### Test 1.1: Creare Material cu Vizibilitate

**User**: Prof. Ana (ana.popescu@roedu.ro)

1. ✅ Login ca profesor
2. ✅ Click "Material Nou"
3. ✅ Completează formular:
   - Titlu: "Test Vizibilitate - Public"
   - Materie: "Matematică"
   - Vizibilitate: **🌐 Public - vizibil pentru toți**
4. ✅ Salvează materialul
5. **Verificare**: Material vizibil în listă cu badge verde 🌐

### Test 1.2: Material Doar Pentru Profesori

**User**: Prof. Ana

1. ✅ Creează material nou
2. ✅ Selectează vizibilitate: **👨‍🏫 Doar profesori**
3. **Verificare**: Badge albastru 👨‍🏫 în listă

### Test 1.3: Material Privat

**User**: Prof. Ana

1. ✅ Creează material nou
2. ✅ Selectează vizibilitate: **🔒 Privat - doar pentru mine**
3. **Verificare**: Badge gri 🔒 în listă

### Test 1.4: Filtrare după Rol - Student

**User**: Student01

1. ✅ Login ca student
2. ✅ Mergi la "Materiale"
3. **Verificare**: Vezi DOAR materiale PUBLIC (🌐)
4. **Verificare**: NU vezi materiale PROFESSORS_ONLY sau PRIVATE

### Test 1.5: Filtrare după Rol - Alt Profesor

**User**: Prof. Mihai

1. ✅ Login ca Prof. Mihai
2. ✅ Mergi la "Materiale"
3. **Verificare**: Vezi materiale PUBLIC (🌐)
4. **Verificare**: Vezi materiale PROFESSORS_ONLY (👨‍🏫)
5. **Verificare**: NU vezi materialele PRIVATE ale Prof. Ana

---

## 💡 Scenario 2: Feedback System

### Test 2.1: Feedback de la Profesor

**User**: Prof. Mihai

1. ✅ Găsește material PUBLIC al Prof. Ana
2. ✅ Click pe card pentru detalii
3. ✅ Click pe butonul **💡 Material util?**
4. **Verificare**: Buton devine activ (galben)
5. **Verificare**: Counter "Profesori" crește cu +1
6. ✅ Click din nou pentru a anula
7. **Verificare**: Counter scade cu -1

### Test 2.2: Feedback de la Student

**User**: Student01

1. ✅ Găsește material PUBLIC
2. ✅ Deschide detalii material
3. ✅ Click pe butonul **⭐ Material util?**
4. **Verificare**: Buton devine activ
5. **Verificare**: Counter "Studenți" crește cu +1

### Test 2.3: Statistici Feedback Separate

**User**: Prof. Ana (owner material)

1. ✅ Deschide propriul material
2. **Verificare**: Secțiunea Feedback afișează:
   - 👨‍🏫 X Profesori (număr profesori care au dat feedback)
   - 👨‍🎓 Y Studenți (număr studenți care au dat feedback)
3. **Verificare**: Contoare separate și corecte

### Test 2.4: Feedback în Lista de Materiale

**User**: Oricare

1. ✅ Mergi la listă materiale
2. **Verificare**: Fiecare card afișează:
   - 💡 X (feedback profesori)
   - ⭐ Y (feedback studenți)
3. **Verificare**: Butonul activ are culoare diferită

---

## 📝 Scenario 3: Sistem Sugestii (GitHub Issues Style)

### Test 3.1: Creare Sugestie

**User**: Prof. Mihai (pe material al Prof. Ana)

1. ✅ Deschide material PUBLIC al Prof. Ana
2. ✅ Click **➕ Propune îmbunătățire**
3. ✅ Se deschide modal sugestii
4. ✅ Click **➕ Sugestie nouă**
5. ✅ Completează:
   - Titlu: "Adaugă mai multe exemple practice"
   - Descriere: "Ar fi util să incluzi 3-4 exemple rezolvate..."
6. ✅ Click **Creează sugestie**
7. **Verificare**: Sugestie apare în listă cu status 🟢 Deschisă

### Test 3.2: Vizualizare Sugestii

**User**: Prof. Ana (owner material)

1. ✅ Deschide propriul material
2. **Verificare**: Afișează **📝 X Sugestii** (X = număr sugestii)
3. ✅ Click pe buton sugestii
4. **Verificare**: Modal cu listă sugestii
5. **Verificare**: Filtre: Toate / 🟢 Deschise / ✅ Rezolvate / 🔒 Închise

### Test 3.3: Comentarii pe Sugestii

**User**: Prof. Ana

1. ✅ Click pe o sugestie din listă
2. ✅ Se deschide detalii sugestie
3. ✅ Scrie comentariu: "Mulțumesc pentru sugestie! O voi implementa."
4. ✅ Click **💬 Adaugă comentariu**
5. **Verificare**: Comentariu apare în listă
6. **Verificare**: Counter comentarii crește

**User**: Prof. Mihai (author sugestie)

1. ✅ Răspunde cu alt comentariu
2. **Verificare**: Conversație funcționează

### Test 3.4: Schimbare Status Sugestie (doar owner)

**User**: Prof. Ana (owner material)

1. ✅ Deschide sugestie în status 🟢 Open
2. **Verificare**: Afișează butoane:
   - ✅ Marchează ca rezolvată
   - 🔒 Închide
3. ✅ Click **✅ Marchează ca rezolvată**
4. **Verificare**: Status devine ✅ Rezolvată
5. **Verificare**: Filtrele se actualizează

**User**: Prof. Mihai (NOT owner)

1. ✅ Deschide aceeași sugestie
2. **Verificare**: NU văd butoane de schimbare status
3. **Verificare**: Pot doar comenta

### Test 3.5: Ștergere Comentariu

**User**: Prof. Mihai

1. ✅ Găsește propriul comentariu
2. **Verificare**: Afișează buton 🗑️ lângă comentariu
3. ✅ Click 🗑️
4. ✅ Confirmă ștergere
5. **Verificare**: Comentariu dispare

**User**: Prof. Ana (alt user)

1. ✅ Privește comentariile Prof. Mihai
2. **Verificare**: NU văd buton 🗑️ (nu pot șterge comentariile altora)

### Test 3.6: Filtrare Sugestii după Status

**User**: Oricare profesor

1. ✅ Deschide modal sugestii
2. ✅ Click **🟢 Deschise**
3. **Verificare**: Afișează doar sugestii cu status OPEN
4. ✅ Click **✅ Rezolvate**
5. **Verificare**: Afișează doar sugestii RESOLVED
6. ✅ Click **Toate**
7. **Verificare**: Afișează toate sugestiile

### Test 3.7: Studenții NU pot vedea Sugestii

**User**: Student01

1. ✅ Deschide material PUBLIC
2. **Verificare**: NU există buton "Propune îmbunătățire"
3. **Verificare**: NU există link către sugestii
4. **Verificare**: Doar feedback ⭐ este disponibil

---

## 🔒 Scenario 4: Permisiuni și Securitate

### Test 4.1: Acces Material Privat

**User**: Prof. Mihai

1. ✅ Încearcă să accesezi direct URL-ul unui material PRIVATE al Prof. Ana
2. **Verificare**: Eroare sau redirect (nu ai acces)

### Test 4.2: Editare Material

**User**: Prof. Mihai

1. ✅ Deschide material PUBLIC al Prof. Ana
2. **Verificare**: NU vezi buton "Editează"
3. **Verificare**: NU vezi buton "Șterge"

**User**: Prof. Ana (owner)

1. ✅ Deschide propriul material
2. **Verificare**: Vezi butoane "Editează" și "Șterge"

### Test 4.3: Creeare Sugestie pe Propriul Material

**User**: Prof. Ana

1. ✅ Deschide propriul material PUBLIC
2. **Verificare**: NU vezi buton "Propune îmbunătățire"
3. **Verificare**: Doar vezi lista sugestiilor existente (dacă există)

---

## 📊 Checklist Final

### Backend ✅

- [x] Server pornit pe port 8000
- [x] Database cu materiale și utilizatori
- [x] Endpoint-uri vizibilitate funcționează
- [x] Endpoint-uri feedback funcționează
- [x] Endpoint-uri sugestii funcționează

### Frontend ✅

- [x] Server pornit pe port 4200
- [x] Dropdown vizibilitate în formular
- [x] Badge-uri vizibilitate în listă
- [x] Butoane feedback în listă și detail
- [x] Modal sugestii complet funcțional

### Funcționalități ✅

- [x] Vizibilitate: PUBLIC / PROFESSORS_ONLY / PRIVATE
- [x] Feedback separat: Profesori vs Studenți
- [x] Sugestii: Creare, comentarii, status
- [x] Permisiuni: Filtrare după rol
- [x] UI: Badge-uri, butoane, contoare

---

## 🚀 Cum să Testezi

1. **Deschide browser**: http://localhost:4200
2. **Login ca profesor**: ana.popescu@roedu.ro / parola123
3. **Urmează scenariile** de mai sus pas cu pas
4. **Schimbă utilizatorul** pentru teste cross-user
5. **Verifică** fiecare punct marcat cu ✅

---

## 🐛 Raportare Bug-uri

Dacă găsești erori, notează:

- ❌ Scenariu: [nume scenariu]
- ❌ Pas: [pas specific]
- ❌ Comportament așteptat: [ce ar trebui să se întâmple]
- ❌ Comportament actual: [ce se întâmplă]
- ❌ Eroare console: [dacă există]

---

## ✅ Status Testare

- [ ] Scenario 1: Vizibilitate Materiale
- [ ] Scenario 2: Feedback System
- [ ] Scenario 3: Sistem Sugestii
- [ ] Scenario 4: Permisiuni și Securitate

**Data testare**: ********\_********
**Tester**: ********\_********
**Rezultat**: ⬜ PASS / ⬜ FAIL
