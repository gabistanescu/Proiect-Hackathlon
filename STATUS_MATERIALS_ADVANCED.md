# 📊 STATUS - Implementare Sistem Materiale Avansat

## ✅ COMPLETAT

### Backend - Modele

- ✅ Actualizat `Material` cu `visibility` (public/professors_only/private)
- ✅ Adăugat `published_at` în Material
- ✅ Creat `MaterialSuggestion` (GitHub-style Issues)
- ✅ Creat `SuggestionComment` pentru comentarii pe sugestii
- ✅ Creat `MaterialFeedbackProfessor` (feedback separat profesori)
- ✅ Creat `MaterialFeedbackStudent` (feedback separat studenți)
- ✅ Rulat migrații database cu succes

### Backend - Infrastructură

- ✅ Endpoint `/api/v1/materials/upload` pentru fișiere
- ✅ Validare fișiere (PDF, DOC, DOCX, PPT, PPTX, TXT)
- ✅ Servire fișiere statice prin `/uploads`

## 🔨 ÎN LUCRU / DE FĂCUT

### Backend - Schema & Endpoint-uri

1. **Actualizare `material_schema.py`**

   ```python
   # Adaugă:
   - VisibilityType enum
   - published_at în MaterialResponse
   - feedback_count_professors în response
   - feedback_count_students în response
   - suggestions_count în response
   ```

2. **Creare `suggestion_schema.py`**

   ```python
   # Schema-uri necesare:
   - SuggestionCreate
   - SuggestionUpdate
   - SuggestionResponse
   - SuggestionCommentCreate
   - SuggestionCommentResponse
   - FeedbackResponse
   ```

3. **Actualizare `materials.py` endpoint-uri**

   - Filtrare după vizibilitate în funcție de rol user
   - Profesorii văd: public + professors_only + propriile private
   - Studenții văd: doar public
   - Owner vede toate materialele sale

4. **Creare `suggestions.py` endpoint-uri**

   ```
   POST   /api/v1/materials/{id}/suggestions          # Creare sugestie
   GET    /api/v1/materials/{id}/suggestions          # Listă sugestii
   GET    /api/v1/suggestions/{id}                    # Detalii sugestie
   PUT    /api/v1/suggestions/{id}                    # Update status
   DELETE /api/v1/suggestions/{id}                    # Șterge sugestie

   POST   /api/v1/suggestions/{id}/comments           # Comentariu nou
   GET    /api/v1/suggestions/{id}/comments           # Listă comentarii
   ```

5. **Adăugare feedback endpoints în `materials.py`**
   ```
   POST   /api/v1/materials/{id}/feedback/professor   # Toggle feedback prof
   POST   /api/v1/materials/{id}/feedback/student     # Toggle feedback student
   GET    /api/v1/materials/{id}/feedback             # Stats feedback
   ```

### Frontend - Modele

6. **Actualizare `material.model.ts`**

   ```typescript
   export enum VisibilityType {
     PUBLIC = "public",
     PROFESSORS_ONLY = "professors_only",
     PRIVATE = "private",
   }

   export interface Material {
     // ... existing
     visibility: VisibilityType;
     published_at: Date;
     feedback_professors_count?: number;
     feedback_students_count?: number;
     suggestions_count?: number;
     user_feedback?: boolean; // A dat feedback userul curent?
   }

   export interface MaterialSuggestion {
     id: number;
     material_id: number;
     professor_id: number;
     title: string;
     description: string;
     status: "open" | "resolved" | "closed";
     created_at: Date;
     updated_at: Date;
     comments_count?: number;
   }
   ```

### Frontend - Servicii

7. **Creare `suggestion.service.ts`**

   - CRUD pentru sugestii
   - Gestionare comentarii
   - Update status

8. **Actualizare `material.service.ts`**
   - Adăugare metode feedback
   - Filtrare după vizibilitate

### Frontend - Componente

9. **Actualizare `material-form.component.ts`**

   - Dropdown pentru vizibilitate
   - UI clar pentru fiecare opțiune

10. **Actualizare `material-list.component.ts`**

    - Badge-uri pentru vizibilitate
    - Contoare feedback (profesori + studenți separate)
    - Icon sugestii dacă există

11. **Actualizare `material-detail.component.ts`**

    - Buton "💡 M-a ajutat" (feedback)
    - Contoare separate feedback profesori/studenți
    - Buton "Sugerează îmbunătățire" → deschide modal
    - Tab sau secțiune pentru sugestii

12. **Creare `material-suggestions.component.ts`** (GitHub Issues style)

    - Listă sugestii cu status (Open/Resolved/Closed)
    - Filtre după status
    - Click pe sugestie → detalii + comentarii
    - Modal pentru creare sugestie nouă
    - Owner poate schimba status

13. **Creare `suggestion-detail.component.ts`**
    - Detalii sugestie
    - Listă comentarii
    - Form adăugare comentariu
    - Butoane status (doar pentru owner material)

### Business Logic

14. **Logică vizibilitate**

    ```typescript
    function canViewMaterial(material: Material, user: User): boolean {
      if (material.visibility === "public") return true;
      if (material.visibility === "private")
        return user.id === material.professor_id;
      if (material.visibility === "professors_only")
        return user.role === "professor";
      return false;
    }

    function canInteract(material: Material, user: User): boolean {
      if (!canViewMaterial(material, user)) return false;
      if (material.visibility === "private") return false; // Fără interacțiune pe private
      return true;
    }
    ```

15. **Logică feedback**

    - Profesori: văd contorul profesori, pot da feedback
    - Studenți: văd contorul studenți, pot da feedback doar pe public
    - Separat afișate: "👨‍🏫 23 profesori" / "👨‍🎓 145 studenți"

16. **Logică sugestii**
    - Doar profesori pot crea sugestii
    - Doar pe materiale public sau professors_only
    - Studenți nu văd secțiunea sugestii deloc
    - Owner material poate schimba status

### Notificări

17. **Reminder anual** (opțional - poate fi implementat mai târziu)
    - Job scheduler care verifică materiale > 1 an fără update
    - Trimite email profesorului
    - UI pentru marcare "Material încă actual"

## 🐛 BUG CURENT

### Rich Text Editor - Literele apar în stânga

**Problema**: Când scrii în editor, cursorul sau textul apare inversat

**Cauză**: `[innerHTML]` binding pe contenteditable resetează DOM-ul

**Soluție**:

- ✅ Eliminat `[innerHTML]="editorContent()"`
- 🔄 Adăugat ViewChild pentru a seta conținutul manual la load
- 🔄 Păstrat CSS `direction: ltr` și `text-align: left`

### Upload File 422 Error

**Problema**: POST /api/v1/materials/upload returnează 422

**Posibile cauze**:

1. Lipsește header `Content-Type: multipart/form-data`
2. Parametrul `file` nu este trimis corect
3. Token autentificare lipsește

**Debug**:

- Verifică console browser pentru request headers
- Testează cu Postman/cURL direct
- Verifică că `FormData` este construit corect

## 📋 ORDINE IMPLEMENTARE RECOMANDATĂ

1. ✅ Migrații database (DONE)
2. 🔄 Fix editor + upload (urgent)
3. Backend schemas (suggestion_schema.py)
4. Backend endpoints sugestii
5. Backend endpoints feedback
6. Frontend models
7. Frontend services
8. Actualizare form cu vizibilitate
9. Actualizare list cu feedback
10. Actualizare detail cu feedback + buton sugestie
11. Componenta sugestii (Issues)
12. Testing complet

## 📞 NEXT STEPS

Pentru a continua, decideți:

1. **Fixăm mai întâi bug-urile** (editor + upload) → Apoi restul
2. **Continuăm implementarea** → Fixăm bug-urile pe parcurs
3. **Testăm ce avem** → Vedem ce funcționează

**Recomandarea mea**: Fixăm bug-urile (15 min), apoi implementăm tot restul pas cu pas (2-3 ore pentru implementare completă).

---

**Ultima actualizare**: 18 Octombrie 2025
**Status**: 30% implementat, 70% de finalizat
