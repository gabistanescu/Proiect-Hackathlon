# RoEdu Frontend - Complete Setup Guide

This guide will walk you through setting up the Angular frontend for the RoEdu Educational Platform.

## Quick Start

### 1. Install Dependencies

```bash
cd roedu-frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:4200`

### 3. Backend Setup

Make sure your backend is running:

```bash
cd roedu-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

Backend should be running on `http://localhost:8000`

## File Structure

After installation, you should have:

```
roedu-frontend/
├── src/
│   ├── app/
│   │   ├── models/                    # Data interfaces
│   │   │   ├── user.model.ts
│   │   │   ├── material.model.ts
│   │   │   ├── quiz.model.ts
│   │   │   └── comment.model.ts
│   │   ├── services/                  # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── api.service.ts
│   │   │   ├── material.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── comment.service.ts
│   │   ├── guards/                    # Route protection
│   │   │   └── auth.guard.ts
│   │   ├── components/                # UI Components
│   │   │   ├── auth/
│   │   │   │   ├── login.component.ts
│   │   │   │   └── register.component.ts
│   │   │   ├── home/
│   │   │   ├── materials/
│   │   │   ├── quizzes/
│   │   │   └── shared/
│   │   ├── pages/                     # Page components
│   │   │   ├── professor/
│   │   │   └── admin/
│   │   ├── app.component.ts           # Root component
│   │   └── app.routes.ts              # Route configuration
│   ├── styles.scss                    # Global styles
│   ├── index.html                     # Main HTML
│   └── main.ts                        # Bootstrap
├── angular.json                       # Angular config
├── package.json                       # Dependencies
└── README.md                          # Project README
```

## Key Components to Implement

### 1. Authentication Components

Create `src/app/components/auth/login.component.ts`:
- Email and password form
- Login button with loading state
- Error handling
- Redirect to home on success

Create `src/app/components/auth/register.component.ts`:
- Prezintă mesaj informativ privind înregistrarea prin administrator
- Include date de contact ale administratorului
- Oferă link rapid către pagina de autentificare

### 2. Material Components

Create `src/app/components/materials/material-list.component.ts`:
- Display materials in a grid
- Search functionality
- Filter by subject, grade, profile type
- Save material functionality

Create `src/app/components/materials/material-detail.component.ts`:
- Display material details
- Show file links
- Comments section
- Ask question feature

### 3. Quiz Components

Create `src/app/components/quizzes/quiz-list.component.ts`:
- List all available quizzes
- Filter by subject
- Show quiz stats

Create `src/app/components/quizzes/quiz-detail.component.ts`:
- Display quiz questions
- Handle user answers
- Submit and get results

### 4. Dashboard Components

Create `src/app/pages/professor/dashboard.component.ts`:
- Show professor statistics
- Materials created
- Quiz results
- Student groups

Create `src/app/pages/admin/dashboard.component.ts`:
- System statistics
- User management
- Logs and audit trail

## API Integration Guide

### Authentication Flow

```typescript
// 1. User enters email and password
// 2. Frontend sends to /auth/login
// 3. Backend returns JWT token
// 4. Frontend stores token in localStorage
// 5. Token is included in all subsequent requests

// Example login:
this.authService.login(email, password).subscribe(
  response => {
    // Token saved, redirect to home
    this.router.navigate(['/']);
  },
  error => {
    // Show error message
    this.error = 'Invalid email or password';
  }
);
```

### Material CRUD

```typescript
// Get all materials
this.materialService.getMaterials().subscribe(materials => {
  this.materials = materials;
});

// Get filtered materials
this.materialService.getMaterials({
  subject: 'Mathematics',
  grade_level: 10,
  profile_type: 'real'
}).subscribe(...);

// Create material
this.materialService.createMaterial(materialData).subscribe(...);

// Update material
this.materialService.updateMaterial(id, updates).subscribe(...);

// Delete material
this.materialService.deleteMaterial(id).subscribe(...);
```

### Quiz Operations

```typescript
// Get all quizzes
this.quizService.getQuizzes().subscribe(...);

// Get quiz by ID
this.quizService.getQuizById(id).subscribe(...);

// Create quiz
this.quizService.createQuiz(quizData).subscribe(...);

// Submit quiz attempt
this.quizService.submitAttempt(quizId, answers).subscribe(...);

// Get quiz results
this.quizService.getResults(quizId).subscribe(...);

// Generate AI quiz
this.quizService.generateAIQuiz(materialId, topic).subscribe(...);
```

## Environment Configuration

### Development

Backend URL: `http://localhost:8000`
Frontend URL: `http://localhost:4200`

Edit `src/app/services/api.service.ts`:

```typescript
private apiUrl = 'http://localhost:8000/api/v1';
```

### Production

Update the API URL to your production backend:

```typescript
private apiUrl = 'https://your-api.com/api/v1';
```

Also update CORS in backend settings:

```python
CORS_ORIGINS = ["https://your-frontend.com"]
```

## Module Installation

The project uses standard Angular modules. All are included in package.json:

```bash
npm install
```

No additional configuration needed.

## Routing Setup

Routes should be defined in `app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'materials',
    component: MaterialListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'materials/:id',
    component: MaterialDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'quizzes',
    component: QuizListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'professor/dashboard',
    component: ProfessorDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['professor'] }
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['administrator'] }
  }
];
```

## Authorization Guards

Create `src/app/guards/auth.guard.ts`:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (this.authService.isAuthenticated()) {
      return of(true);
    }
    this.router.navigate(['/login']);
    return of(false);
  }
}
```

Create `src/app/guards/role.guard.ts`:

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (user && route.data['roles'].includes(user.role)) {
          return true;
        }
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
```

## Common Issues & Solutions

### CORS Errors

**Problem**: "No 'Access-Control-Allow-Origin' header"

**Solution**: Update backend CORS settings:

```python
# roedu-backend/src/config/settings.py
CORS_ORIGINS = [
    "http://localhost:4200",
    "http://localhost:3000"
]
```

### Token Not Persisting

**Problem**: User logged out after page refresh

**Solution**: Ensure token is loaded on app init:

```typescript
// In AuthService constructor
this.loadCurrentUser();

// This method loads user if token exists
loadCurrentUser(): void {
  if (localStorage.getItem('access_token')) {
    this.apiService.get<User>('/auth/me').subscribe(...)
  }
}
```

### 404 Errors on Components

**Problem**: Components not found

**Solution**: Make sure all components are created and imported properly:

```bash
ng generate component components/auth/login
ng generate component components/home/home
# etc.
```

### API Calls Failing

**Problem**: 401 Unauthorized errors

**Solution**: Check:
1. Token is in localStorage
2. Token is not expired
3. Authorization header is being sent
4. Backend is running

## Testing

Run tests with:

```bash
npm test
```

## Building for Production

Build optimized bundle:

```bash
npm run build
```

Output in `dist/roedu-frontend/`

Deploy using:
- Vercel
- Netlify
- Apache/Nginx
- Cloud services (AWS, Azure, Google Cloud)

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Start frontend server
4. Create Login component
5. Create Register component
6. Create Home component
7. Create Material components
8. Create Quiz components
9. Create Dashboard components
10. Set up routing
11. Test all features
12. Deploy

## Need Help?

- Check Angular documentation: https://angular.dev
- Review backend API docs: http://localhost:8000/docs
- Check browser console for errors
- Use Angular DevTools browser extension

Happy coding! 🚀
