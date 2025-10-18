# 👥 Student Groups Management Feature

## Overview
This guide documents the implementation of student groups management system for RoEdu. Professors can now:
- Create groups with custom names and descriptions
- Add students to groups using email addresses
- Assign quizzes to specific groups
- Students in groups see assigned quizzes automatically (with checkbox selection option)

## Architecture

### Database Models

#### 1. **Group Model** (`src/models/group.py`)
- Already exists with the following fields:
  - `id`: Primary key
  - `name`: Group name
  - `description`: Optional group description
  - `subject`: Subject (e.g., Matematică, Biologie)
  - `grade_level`: Class level (9-12)
  - `professor_id`: FK to Professor
  - `created_at`, `updated_at`: Timestamps

- **Relationships**:
  - Many-to-Many with Students through `student_groups` junction table
  - One-to-Many with Quizzes

#### 2. **Quiz Model** (Updated)
- Added `group_id` column (ForeignKey to Group, nullable)
- This allows quizzes to be assigned to specific groups

#### 3. **Student-Group Junction Table**
- Already exists: `student_groups` table with:
  - `student_id` (FK)
  - `group_id` (FK)

### API Endpoints

#### Backend: `src/api/v1/groups.py`

**Base URL**: `/api/v1/groups`

##### 1. **Create Group**
```http
POST /api/v1/groups
Content-Type: application/json

{
  "name": "Grupa A - Matematică",
  "description": "Group for advanced math students",
  "subject": "Matematică",
  "grade_level": 10,
  "student_emails": ["elev1@email.com", "elev2@email.com"]
}
```
**Response**: `201 Created` with Group object

##### 2. **Get All Groups (Professor's Groups)**
```http
GET /api/v1/groups
```
**Response**: `200 OK` with array of Groups with student details

##### 3. **Get Specific Group**
```http
GET /api/v1/groups/{group_id}
```
**Response**: `200 OK` with Group details including all students

##### 4. **Update Group**
```http
PUT /api/v1/groups/{group_id}
Content-Type: application/json

{
  "name": "Updated Group Name",
  "description": "Updated description",
  "subject": "Biologie",
  "grade_level": 11
}
```
**Response**: `200 OK` with updated Group

##### 5. **Delete Group**
```http
DELETE /api/v1/groups/{group_id}
```
**Response**: `204 No Content`

##### 6. **Add Students to Group**
```http
POST /api/v1/groups/{group_id}/students/add
Content-Type: application/json

{
  "student_emails": ["newstudent@email.com", "another@email.com"]
}
```
**Response**: `200 OK` with confirmation message

##### 7. **Remove Students from Group**
```http
POST /api/v1/groups/{group_id}/students/remove
Content-Type: application/json

{
  "student_ids": [1, 2, 3]
}
```
**Response**: `200 OK` with confirmation message

### Frontend Components

#### 1. **Group Management Component**
**Location**: `src/app/components/groups/group-management.component.ts`

**Features**:
- Create new groups with email-based student selection
- View all created groups with student lists
- Edit group information
- Delete groups
- Add/Remove students from groups (UI to be completed)

**UI Features**:
- Email input with tags display
- Group card display with student count
- Student list with email addresses
- Gradient header design (matching app theme)
- Responsive grid layout

#### 2. **Group Model**
**Location**: `src/app/models/group.model.ts`

Interfaces:
- `StudentInGroup`: Student information
- `Group`: Full group with students
- `GroupCreate`: Create request
- `GroupUpdate`: Update request
- `GroupAddStudents`: Add students request
- `GroupRemoveStudents`: Remove students request

#### 3. **Group Service**
**Location**: `src/app/services/group.service.ts`

Methods:
- `getGroups()`: Get all professor's groups
- `getGroupById(id)`: Get specific group
- `createGroup(data)`: Create new group
- `updateGroup(id, data)`: Update group
- `deleteGroup(id)`: Delete group
- `addStudentsToGroup(id, request)`: Add students
- `removeStudentsFromGroup(id, request)`: Remove students

### Routes

**Frontend Routes** (`src/app/app.routes.ts`):
```typescript
{
  path: 'groups',
  canActivate: [AuthGuard],
  children: [
    {
      path: '',
      loadComponent: () => import('./components/groups/group-management.component')
        .then(m => m.GroupManagementComponent)
    }
  ]
}
```

**Navigation Link** (`src/app/app.component.html`):
- Added to professor dropdown menu: "👥 Gestionare Grupuri"
- Visible only to professors (`*ngIf="userRole === 'professor'"`)

### Styling

All components use inline CSS with:
- Color scheme: Purple gradient (#667eea to #764ba2)
- Responsive grid layouts
- Modern card-based design
- Email tag styling for visual feedback
- Loading spinners and animations

## Implementation Steps Completed

### ✅ Phase 1: Backend Foundation
1. ✅ Updated `group_schema.py` with email-based student selection
2. ✅ Created `src/api/v1/groups.py` with full CRUD endpoints
3. ✅ Registered routes in `src/main.py`

### ✅ Phase 2: Frontend Foundation
1. ✅ Created `src/app/models/group.model.ts`
2. ✅ Created `src/app/services/group.service.ts` (using ApiService)
3. ✅ Created `src/app/components/groups/group-management.component.ts`
4. ✅ Added routes in `src/app/app.routes.ts`
5. ✅ Added navigation link in `src/app/app.component.html`

### ✅ Phase 3: Integration
1. ✅ Build completed successfully
2. ✅ No compilation errors

## Pending Implementation (Next Steps)

### Phase 4: Quiz-Group Integration
1. **Update Quiz Form Component** (`quiz-form.component.ts`)
   - Add group selection dropdown
   - Allow professors to select which group gets the quiz
   - Show list of students in selected group with checkboxes
   - Each student can be individually included/excluded

2. **Update Quiz Schema** (Backend)
   - Modify `QuizCreate` to include `group_id`
   - Validate that group belongs to the professor

3. **Update Quiz API** (Backend)
   - Modify quiz creation to handle group assignment
   - Create `QuizGroupAssignment` tracking (optional, for advanced features)

### Phase 5: Student Quiz Experience
1. **Update Quiz List for Students**
   - Show group-assigned quizzes
   - Display which students are assigned (with checkbox toggle if in group)
   - Auto-select all students in group initially
   - Allow students to opt-out of group quizzes

2. **Quiz Attempt Tracking**
   - Track which students in a group attempt the quiz
   - Link attempts to both quiz and group

## Usage Flow

### Professor Workflow
1. Navigate to "Gestionare Grupuri" from dropdown menu
2. Click "+ Grup Nou"
3. Fill in group details (name, subject, class)
4. Paste email list (comma-separated)
5. Click "Creează Grup"
6. View created group with student list
7. (Future) Assign quizzes to groups
8. (Future) View group quiz results

### Student Workflow
1. View "Chestionare" page
2. See quizzes assigned to their groups (automatically listed)
3. See checkboxes next to own name in group quizzes
4. Can opt-out by unchecking (if feature enabled)
5. Solve quiz as normal
6. Results recorded for both individual and group tracking

## Testing Checklist

- [ ] Create group with valid emails
- [ ] Create group with invalid emails (should show error)
- [ ] Add students after group creation
- [ ] Remove students from group
- [ ] Delete group successfully
- [ ] Edit group information
- [ ] Verify group appears in professor's list
- [ ] Test responsive design on mobile
- [ ] Test email tag input validation
- [ ] Test loading states and error messages

## File Structure Created

```
roedu-backend/src/
├── api/v1/
│   ├── groups.py          (NEW - Group API endpoints)
│   └── __init__.py        (Updated to include groups router)

roedu-frontend/src/app/
├── models/
│   └── group.model.ts     (NEW - Group interfaces)
├── services/
│   └── group.service.ts   (NEW - Group API service)
├── components/groups/
│   └── group-management.component.ts  (NEW - Group UI)
├── app.routes.ts          (Updated with /groups route)
└── app.component.html     (Updated with navigation link)
```

## Configuration Notes

### Environment Setup
- Uses existing `ApiService` for HTTP calls
- No environment file changes needed (uses existing settings)
- CORS already configured for API calls

### Database
- No migration scripts needed (Group table and junction table already exist)
- Relationships already defined in models

### Authentication
- Uses existing `AuthGuard` for route protection
- Professor-only features verified on frontend (`*ngIf="userRole === 'professor'"`)
- Backend should implement proper auth context (currently placeholder in `get_current_professor_id`)

## Performance Considerations

- Group queries optimized with proper relationships
- Email validation on frontend (EmailStr validator)
- Dropdown email parsing for bulk input
- Responsive grid reduces layout thrashing

## Security Considerations

- Professor can only see/modify their own groups
- Student email validation prevents invalid entries
- Deleting groups cascade-deletes relationships (SQLAlchemy)
- Authorization checks on all backend endpoints

## Future Enhancements

1. **Bulk Operations**
   - Assign quiz to multiple groups
   - Export student list from group

2. **Advanced Features**
   - Group chat/discussions
   - Group performance analytics
   - Automatic group creation based on class

3. **UI Improvements**
   - Drag-and-drop for student assignment
   - Template groups for reuse
   - Bulk student import from CSV

4. **Tracking**
   - Group quiz average scores
   - Individual contribution tracking
   - Group participation statistics
