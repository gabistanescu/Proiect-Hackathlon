# RoEdu Educational Platform - Frontend

A modern, responsive Angular application for the RoEdu Educational Platform. This frontend provides an intuitive interface for administrators, professors, and students to manage educational materials, quizzes, and learning resources.

## 🎯 Features

- **User Authentication**: Secure login with administrator-managed onboarding
- **Material Management**: Upload, manage, and share educational materials
- **Quiz System**: Create and take interactive quizzes with multiple question types
- **Comments & Feedback**: Provide feedback and ask questions on materials
- **Role-Based Access**: Tailored interfaces for administrators, professors, and students
- **Search & Filter**: Find materials by subject, grade level, and profile type
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Framework**: Angular 19
- **Language**: TypeScript 5.6
- **Styling**: SCSS
- **HTTP Client**: HttpClient
- **State Management**: RxJS
- **Package Manager**: npm
- **Build Tool**: Angular CLI 19

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI 19
- Backend API running on `http://localhost:8000`

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

Edit `src/app/services/api.service.ts` and update the API URL if needed:

```typescript
private apiUrl = 'http://localhost:8000/api/v1';
```

### 3. Start Development Server

```bash
npm start
```

The application will automatically open at `http://localhost:4200`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/              # Login and registration
│   │   ├── home/              # Home page
│   │   ├── materials/         # Material listing and details
│   │   ├── quizzes/           # Quiz listing and taking
│   │   └── shared/            # Shared components
│   ├── pages/
│   │   ├── professor/         # Professor dashboard
│   │   └── admin/             # Admin dashboard
│   ├── services/
│   │   ├── auth.service.ts    # Authentication
│   │   ├── api.service.ts     # API calls
│   │   ├── material.service.ts
│   │   ├── quiz.service.ts
│   │   └── comment.service.ts
│   ├── models/                # TypeScript interfaces
│   ├── guards/                # Route guards
│   ├── app.component.ts       # Root component
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Route definitions
├── styles.scss                # Global styles
├── index.html                 # Main HTML file
└── main.ts                    # Bootstrap file
```

## 🔐 Authentication

The application uses JWT token-based authentication:

1. User logs in with email and password
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent in Authorization header for authenticated requests
5. On page refresh, token is validated and user data is reloaded

### API Endpoints Used

- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/verify` - Verify token
- `POST /api/v1/administrators/users/administrators` - Create administrator (admin only)
- `POST /api/v1/administrators/users/professors` - Create professor (admin only)
- `POST /api/v1/administrators/users/students` - Create student (admin only)

## 👥 User Roles

### Administrator
- Manage professors and school database
- View audit logs
- Manage system security

### Professor
- Create and manage educational materials
- Create and manage quizzes
- Create student groups
- View student progress
- Approve student feedback

### Student
- Browse and save materials
- Take quizzes
- Provide feedback on materials
- Ask questions on materials

## 📱 Components Overview

### Auth Components
- **LoginComponent**: User login interface
- **RegisterComponent**: Informational page on how to obtain access from the administrator

### Material Components
- **MaterialListComponent**: Browse and search materials
- **MaterialDetailComponent**: View material details and comments
- **CreateMaterialComponent** (Professor): Upload and create materials

### Quiz Components
- **QuizListComponent**: Browse available quizzes
- **QuizDetailComponent**: Take a quiz
- **CreateQuizComponent** (Professor): Create new quizzes
- **QuizResultsComponent**: View quiz results

### Dashboard Components
- **ProfessorDashboardComponent**: Professor overview and statistics
- **AdminDashboardComponent**: Administrator system management

## 🎨 Styling

The application uses a modern design system with:

- **Primary Color**: #4f46e5 (Indigo)
- **Secondary Color**: #06b6d4 (Cyan)
- **Utility Classes**: buttons, cards, forms, grid layouts
- **Responsive Grid**: Auto-fit layout with media queries
- **Animations**: Smooth transitions and loading states

Global styles are in `src/styles.scss` and component-specific styles are in SCSS files.

## 🔌 Services

### AuthService
Handles user authentication, login, and token management.

```typescript
login(email: string, password: string): Observable<TokenResponse>
logout(): void
getCurrentUser(): Observable<User | null>
isAuthenticated(): boolean
```

### ApiService
Generic HTTP service for API communication with token injection.

```typescript
get<T>(endpoint: string): Observable<T>
post<T>(endpoint: string, data: any): Observable<T>
put<T>(endpoint: string, data: any): Observable<T>
delete<T>(endpoint: string): Observable<T>
```

### MaterialService
Manages educational materials CRUD operations and search.

```typescript
getMaterials(params?: MaterialSearchParams): Observable<Material[]>
getMaterialById(id: number): Observable<Material>
createMaterial(material: MaterialCreate): Observable<Material>
updateMaterial(id: number, material): Observable<Material>
deleteMaterial(id: number): Observable<void>
saveMaterial(id: number): Observable<void>
searchMaterials(query: string): Observable<Material[]>
uploadFiles(files: File[]): Observable<{ file_paths: string[] }>
```

### QuizService
Manages quizzes, questions, and quiz attempts.

```typescript
getQuizzes(): Observable<Quiz[]>
getQuizById(id: number): Observable<Quiz>
createQuiz(quiz: QuizCreate): Observable<Quiz>
updateQuiz(id: number, quiz): Observable<Quiz>
deleteQuiz(id: number): Observable<void>
copyQuiz(id: number): Observable<Quiz>
submitAttempt(id: number, answers): Observable<QuizAttempt>
getResults(id: number): Observable<QuizAttempt[]>
generateAIQuiz(materialId, topic): Observable<Quiz>
```

### CommentService
Manages material comments and feedback.

```typescript
getComments(materialId?: number): Observable<Comment[]>
getCommentById(id: number): Observable<Comment>
createComment(comment: CommentCreate): Observable<Comment>
updateComment(id: number, comment): Observable<Comment>
deleteComment(id: number): Observable<void>
approveComment(id: number): Observable<Comment>
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🏗️ Building for Production

Build optimized production bundle:

```bash
npm run build
```

Output files will be in the `dist/` directory.

### Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/roedu-frontend` folder to your web server

3. Configure web server to serve `index.html` for all routes (SPA configuration)

### Environment Configuration

For production, update the API URL in `src/app/services/api.service.ts`:

```typescript
private apiUrl = 'https://your-production-api.com/api/v1';
```

## 📞 API Integration

The frontend communicates with the backend API at `http://localhost:8000/api/v1`. Make sure:

1. Backend server is running
2. CORS is properly configured
3. JWT token is included in request headers

## 🐛 Troubleshooting

### CORS Issues
If you get CORS errors, make sure the backend has CORS enabled for your frontend URL:

```python
# In backend settings
CORS_ORIGINS = ["http://localhost:4200", "http://localhost:3000"]
```

### Authentication Errors
- Check that token is properly stored in localStorage
- Verify backend is returning valid JWT tokens
- Check token expiration time

### API Connection
- Ensure backend is running on `http://localhost:8000`
- Check network tab in browser dev tools
- Verify API endpoint URLs match backend routes

## 📚 Learning Resources

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [RxJS Documentation](https://rxjs.dev)

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use meaningful variable and function names
- Add comments for complex logic

### Component Structure
- Separate logic into services
- Use pipes for data transformation
- Implement OnDestroy for cleanup
- Use trackBy for ngFor loops

### State Management
- Use BehaviorSubjects for shared state
- Subscribe in components with takeUntil
- Unsubscribe in ngOnDestroy
- Use async pipe when possible

## 🤝 Contributing

1. Create a feature branch
2. Commit changes with clear messages
3. Submit a pull request
4. Ensure all tests pass

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👨‍💻 Support

For issues, questions, or suggestions, please open an issue or contact the development team.

---

**RoEdu Educational Platform** - Modern, equitable education for all Romanian students 🇷🇴
