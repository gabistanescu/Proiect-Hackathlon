# 🚀 QUICK START - Testing Guide

## ✅ Status Current

**Backend**: ✅ RUNNING on http://localhost:8000  
**Frontend**: ✅ RUNNING on http://localhost:4200  
**Browser**: ✅ OPENED

---

## 🎯 Quick Test (5 minute)

### 1. Login ca Profesor

```
URL: http://localhost:4200
Email: ana.popescu@roedu.ro
Password: parola123
```

### 2. Creează Material cu Vizibilitate

- Click **➕ Material Nou**
- Completează titlu: "Test Vizibilitate"
- Materie: "Matematică"
- **Vizibilitate**: Alege **🌐 Public**
- Click **Creează Material**
- ✅ Verifică: Badge verde 🌐 în listă

### 3. Testează Feedback

- Click pe material creat
- Scroll la secțiunea **💡 Feedback**
- Vezi stats: 👨‍🏫 0 Profesori, 👨‍🎓 0 Studenți
- Logout

### 4. Login ca Alt Profesor

```
Email: mihai.ionescu@roedu.ro
Password: parola123
```

- Găsește materialul Anei
- Click pe material
- Click **💡 Material util?**
- ✅ Verifică: Buton devine galben, counter = 1

### 5. Testează Sugestii

- Pe același material
- Click **➕ Propune îmbunătățire**
- Modal se deschide
- Click **➕ Sugestie nouă**
- Titlu: "Adaugă exemple"
- Descriere: "Ar fi util să incluzi mai multe exemple practice"
- Click **Creează sugestie**
- ✅ Verifică: Sugestie apare cu status 🟢 Deschisă

### 6. Login ca Owner (Ana)

```
Email: ana.popescu@roedu.ro
Password: parola123
```

- Deschide materialul tău
- Vezi **📝 1 Sugestie**
- Click pe buton sugestii
- Click pe sugestia lui Mihai
- Adaugă comentariu: "Mulțumesc! O voi implementa."
- Click **✅ Marchează ca rezolvată**
- ✅ Verifică: Status devine ✅ Rezolvată

### 7. Testează ca Student

```
Email: student01@roedu.ro
Password: parola123
```

- Mergi la Materiale
- ✅ Verifică: Vezi DOAR materiale PUBLIC (🌐)
- Click pe material
- Click **⭐ Material util?**
- ✅ Verifică: Counter studenți crește

---

## 📚 Documentație Detaliată

Pentru testare completă, vezi:

- **TEST_SCENARIOS.md** - 40+ scenarii de testare
- **IMPLEMENTATION_SUMMARY.md** - Documentație tehnică completă

---

## 🐛 Debug

Dacă ceva nu merge:

1. **Check Backend**:

   - Terminal backend arată erori?
   - http://localhost:8000/docs - API documentation

2. **Check Frontend**:

   - Browser console (F12) - erori?
   - Network tab - request-uri failed?

3. **Check Database**:
   ```bash
   cd roedu-backend
   python check_db.py
   ```

---

## ✅ Ce Să Testezi

- [ ] Vizibilitate: PUBLIC / PROFESSORS_ONLY / PRIVATE
- [ ] Badge-uri colorate în listă
- [ ] Feedback profesori (💡)
- [ ] Feedback studenți (⭐)
- [ ] Creare sugestii
- [ ] Comentarii pe sugestii
- [ ] Schimbare status sugestii (doar owner)
- [ ] Filtre după status
- [ ] Permisiuni (student nu vede PROFESSORS_ONLY)

---

## 🎉 Success Criteria

✅ Poți crea materiale cu vizibilitate diferită  
✅ Studenții văd doar PUBLIC  
✅ Profesorii văd PUBLIC + PROFESSORS_ONLY  
✅ Feedback funcționează separat pentru profesori/studenți  
✅ Sugestii se creează și se pot comenta  
✅ Doar owner-ul poate schimba status sugestii

**Dacă toate astea funcționează → SISTEM COMPLET! 🚀**
