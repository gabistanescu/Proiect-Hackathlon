# 🔐 Autentificare Frontend - RoEdu

## 📋 Prezentare Generală

Frontend-ul RoEdu **NU permite înregistrare publică**. Pagina de register afișează doar un mesaj informativ.

## 🚫 Fără Funcționalitate de Register

### Ce S-a Modificat

#### ❌ ÎNAINTE (Înregistrare Activă)

```
/register → Formular funcțional de creare cont
```

#### ✅ ACUM (Înregistrare Închisă)

```
/register → Mesaj informativ + instrucțiuni
```

## 📄 Pagina de Register

### Locație

`src/app/components/auth/register.component.ts`

### Funcționalitate

Afișează un mesaj informativ care explică:

- ✅ Înregistrarea este închisă
- ✅ Cum să obții acces (contactează administratorul școlii)
- ✅ Link către pagina de login
- ✅ Contact pentru administratori de școli noi

### Preview Mesaj

```
📋 Cum obții un cont?
Înregistrarea publică nu este disponibilă. Pentru a accesa platforma,
trebuie să primești credențiale de la administratorul școlii tale.

👥 Pentru profesori și elevi
Contactează administratorul școlii tale pentru a primi:
• Numele de utilizator sau email-ul
• Parola inițială
• Instrucțiuni de acces

🏫 Pentru administratori de școală
Dacă ești administrator de școală și ai nevoie de acces la platformă,
contactează echipa RoEdu la: admin@roedu.ro
```

## 🔄 Rute Disponibile

### `/login` - Pagina de Autentificare

**Funcționalitate**: Login complet funcțional

```typescript
// src/app/components/auth/login.component.ts
- Input: Email + Parolă
- Submit → AuthService.login()
- Success → Redirect la /
- Error → Alert cu mesaj
```

### `/register` - Pagina Informativă

**Funcționalitate**: Doar mesaj informativ

```typescript
// src/app/components/auth/register.component.ts
- Nu există formular
- Nu există input fields
- Nu există submit
- Doar text + link către /login
```

## 🛡️ Securitate

### Guard-uri

```typescript
// src/app/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(["/login"]);
  return false;
};
```

### Protected Routes

```typescript
{
  path: 'materials',
  canActivate: [authGuard],
  loadComponent: () => import('./components/materials/...')
}
```

## 📝 Service de Autentificare

### Locație

`src/app/services/auth.service.ts`

### Metode Disponibile

#### Login

```typescript
login(email: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/login`, { email, password })
    .pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.currentUserSubject.next(response.user);
      })
    );
}
```

#### Logout

```typescript
logout(): void {
  localStorage.removeItem('token');
  this.currentUserSubject.next(null);
  this.router.navigate(['/login']);
}
```

#### Verificare Autentificare

```typescript
isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
```

## 🎨 Styling

Pagina de register folosește același stil ca și pagina de login:

- Gradient background
- Card centrat
- Secțiuni cu border-left color
- Button-uri responsive
- Hover effects

## 🔍 Testing Manual

### 1. Verificare Pagină Register

```
1. Deschide http://localhost:4200/register
2. ✅ Vezi mesaj informativ (nu formular)
3. ✅ Vezi link către /login
4. ✅ Vezi informații de contact
```

### 2. Verificare Login

```
1. Deschide http://localhost:4200/login
2. Introdu: admin@roedu.ro / Admin123!
3. Click "Sign In"
4. ✅ Redirect la homepage
5. ✅ Token salvat în localStorage
```

### 3. Verificare Protected Routes

```
1. Logout
2. Încearcă să accesezi /materials
3. ✅ Redirect automat la /login
```

## 🚀 Development

### Pornire Server

```bash
cd roedu-frontend
npm install
npm start
# Sau: ng serve
```

### Build Production

```bash
npm run build
# Outputs la: dist/
```

## 📚 Fișiere Importante

```
roedu-frontend/
├── src/app/
│   ├── components/auth/
│   │   ├── login.component.ts      ← Login funcțional
│   │   └── register.component.ts   ← Mesaj informativ
│   ├── services/
│   │   └── auth.service.ts         ← Service autentificare
│   ├── guards/
│   │   └── auth.guard.ts           ← Protecție rute
│   └── app.routes.ts               ← Definire rute
```

## 🔗 Integrare Backend

### Endpoints Folosite

```typescript
// Login
POST /api/v1/auth/login
Body: { email: string, password: string }
Response: { access_token: string, token_type: string }

// Verificare Token
GET /api/v1/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { id, username, email, role, ... }

// Verify Token
GET /api/v1/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { valid: boolean, user_id, role }
```

### Headers

```typescript
const headers = new HttpHeaders({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});
```

## ⚙️ Configurare

### Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000/api/v1",
};
```

### API Service

```typescript
// src/app/services/api.service.ts
private apiUrl = environment.apiUrl;
```

## 🎯 User Stories

### ✅ Ca utilizator fără cont

```
GIVEN sunt pe pagina /register
WHEN vizualizez pagina
THEN văd instrucțiuni clare despre cum să obțin acces
AND văd un link către pagina de login
AND văd informații de contact pentru suport
```

### ✅ Ca utilizator cu cont

```
GIVEN am credențiale valide
WHEN mă autentific pe /login
THEN sunt redirecționat către homepage
AND pot accesa toate resursele pentru care am permisiuni
```

### ✅ Ca administrator de școală

```
GIVEN vreau să adaug profesori/elevi
WHEN sunt autentificat ca administrator
THEN pot accesa dashboard-ul de administrare
AND pot crea conturi noi pentru profesori și elevi
```

## 🚨 Important

### ⚠️ NU adăuga funcționalitate de register!

- Pagina `/register` trebuie să rămână doar informativă
- Nu crea formulare de înregistrare
- Nu adăuga endpoint-uri de register în frontend

### ✅ Menține siguranța

- Token-ul este stocat în localStorage
- Guard-urile protejează rutele sensibile
- Logout-ul șterge complet token-ul

---

**Versiune**: 1.0  
**Ultima actualizare**: Octombrie 2025
