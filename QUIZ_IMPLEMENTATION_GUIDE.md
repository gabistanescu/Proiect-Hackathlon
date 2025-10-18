# Quiz Implementation Guide - Grila & Libre Text Questions

## Overview

This guide explains the new quiz system implementation in RoEdu with support for two question types:

1. **Grila Questions** (Multiple/Single Choice)
   - `SINGLE_CHOICE` - Only one correct answer
   - `MULTIPLE_CHOICE` - Multiple correct answers possible

2. **Libre Text Questions** (Free Text Answers)
   - `FREE_TEXT` - Student writes their own answer
   - Automatic scoring based on keyword matching and exact matches

---

## Backend Changes

### 1. Database Models (`roedu-backend/src/models/quiz.py`)

**New Enum:**
```python
class QuestionType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    FREE_TEXT = "free_text"
```

**Question Model Updates:**
- `options`: Now `nullable=True` (required only for grila questions)
- `evaluation_criteria`: New field for FREE_TEXT questions to store keywords/examples for evaluation

### 2. Schemas (`roedu-backend/src/schemas/quiz_schema.py`)

- QuestionType enum updated with new values
- `QuestionBase` updated with optional `evaluation_criteria` field
- Schemas support both grila and libre text question types

### 3. API Endpoints (`roedu-backend/src/api/v1/quizzes.py`)

**New Scoring Logic:**

```python
def score_free_text_answer(student_answer: str, evaluation_criteria: str, correct_answers: List[str]) -> tuple[float, bool]:
```

This function:
- Returns exact match (1.0) if student answer matches any correct answer
- Returns partial credit (0.5) if keywords from evaluation_criteria are present
- Returns 0 if no match

**Updated Endpoints:**
- `POST /quizzes/{quiz_id}/attempt` - Now handles both grila and libre text scoring
- `GET /quizzes/attempts/{attempt_id}` - Returns detailed scoring information

---

## Frontend Changes

### 1. Models (`roedu-frontend/src/app/models/quiz.model.ts`)

```typescript
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  FREE_TEXT = 'free_text'
}
```

### 2. Components

#### Quiz Form Component (`quiz-form.component.ts`)
- Create/edit quizzes with different question types
- Dynamic option management for grila questions
- Evaluation criteria input for libre text questions

**Features:**
- Question type selector with conditional fields
- Add/remove options for grila questions
- Evaluation criteria textarea for libre text
- Form validation

#### Take Quiz Component (`quiz-take.component.ts`)
- Display quiz with progress tracking
- Single choice: Radio buttons
- Multiple choice: Checkboxes
- Free text: Textarea input
- Timer support with auto-submission
- Question navigator sidebar

**Methods:**
- `isGrilaQuestion()` - Determines if question is multiple/single choice
- `toggleOption()` - Handles option selection
- `submitQuiz()` - Submits answers to backend

---

## Question Type Specifications

### Single Choice (Grila)
```json
{
  "question_type": "single_choice",
  "options": ["Option 1", "Option 2", "Option 3"],
  "correct_answer": ["Option 2"],
  "points": 1.0
}
```

**Scoring:** All or nothing (full points if exact match, 0 otherwise)

### Multiple Choice (Grila)
```json
{
  "question_type": "multiple_choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": ["Option A", "Option C"],
  "points": 2.0
}
```

**Scoring:** All or nothing (all correct answers must be selected, nothing else)

### Free Text (Libre)
```json
{
  "question_type": "free_text",
  "correct_answer": ["mitochondrion", "mitochondria"],
  "evaluation_criteria": "[\"cellular respiration\", \"energy\", \"ATP\"]",
  "points": 2.0
}
```

**Scoring:**
- 1.0 (100%): Exact match with any correct answer
- 0.5 (50%): Contains keywords from evaluation_criteria
- 0.0 (0%): No match

---

## Integration Steps

### Backend Integration

1. **Update Models** ✅ Done
   ```bash
   # Models updated with new QuestionType enum
   ```

2. **Update Schemas** ✅ Done
   ```bash
   # Schemas include new question types
   ```

3. **Update API** ✅ Done
   ```bash
   # scoring logic for grila and libre text
   ```

4. **Database Migration** (if needed)
   ```bash
   python roedu-backend/migrations/add_quiz_enhancements.py
   ```

### Frontend Integration

1. **Update Models** ✅ Done
   ```typescript
   // Quiz model includes new QuestionType enum
   ```

2. **Add Components** ✅ Done
   - `quiz-form.component.ts/html` - Create/edit quizzes
   - `quiz-take.component.ts/html` - Take quizzes
   - `quiz-form.component.scss` - Form styling
   - `quiz-take.component.scss` - Quiz taking styling

3. **Update Routes** (if needed)
   ```typescript
   // Add to app.routes.ts
   {
     path: 'quizzes/create',
     component: QuizFormComponent
   },
   {
     path: 'quizzes/:id/take',
     component: QuizTakeComponent
   }
   ```

4. **Update App Module**
   ```typescript
   // Add components to declarations
   declarations: [
     QuizFormComponent,
     QuizTakeComponent
   ]
   ```

---

## API Usage Examples

### Create Quiz with Mixed Question Types

```bash
curl -X POST http://localhost:8000/quizzes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Biology Quiz 1",
    "description": "Basic biology concepts",
    "subject": "Biology",
    "grade_level": 10,
    "time_limit": 30,
    "questions": [
      {
        "question_text": "What is the powerhouse of the cell?",
        "question_type": "single_choice",
        "options": ["Nucleus", "Mitochondrion", "Golgi", "Ribosome"],
        "correct_answers": ["Mitochondrion"],
        "points": 1.0
      },
      {
        "question_text": "Select all eukaryotic organelles:",
        "question_type": "multiple_choice",
        "options": ["Mitochondrion", "Ribosome", "Nucleus", "Chloroplast"],
        "correct_answers": ["Mitochondrion", "Nucleus", "Chloroplast"],
        "points": 2.0
      },
      {
        "question_text": "Explain photosynthesis in 2-3 sentences",
        "question_type": "free_text",
        "correct_answers": ["Process of converting light to chemical energy"],
        "evaluation_criteria": "[\"light energy\", \"glucose\", \"oxygen\", \"chlorophyll\"]",
        "points": 3.0
      }
    ]
  }'
```

### Submit Quiz Attempt

```bash
curl -X POST http://localhost:8000/quizzes/1/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": 1,
    "answers": {
      "1": ["Mitochondrion"],
      "2": ["Mitochondrion", "Nucleus", "Chloroplast"],
      "3": ["Light energy is converted into chemical energy in glucose molecules"]
    }
  }'
```

### Get Quiz Results

```bash
curl -X GET http://localhost:8000/quizzes/attempts/1 \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "attempt": {
    "id": 1,
    "quiz_id": 1,
    "student_id": 5,
    "score": 5.5,
    "max_score": 6.0,
    "completed_at": "2025-10-18T14:30:00"
  },
  "correct_answers": {
    "1": ["Mitochondrion"],
    "2": ["Mitochondrion", "Nucleus", "Chloroplast"],
    "3": ["Process of converting light to chemical energy"]
  },
  "student_answers": {
    "1": ["Mitochondrion"],
    "2": ["Mitochondrion", "Nucleus", "Chloroplast"],
    "3": ["Light energy is converted to chemical energy"]
  },
  "question_scores": {
    "1": 1.0,
    "2": 2.0,
    "3": 2.5
  }
}
```

---

## Testing Guide

### Backend Testing

1. **Test Single Choice Scoring**
   ```python
   # Answer correct single choice → Full points
   # Answer incorrect → 0 points
   ```

2. **Test Multiple Choice Scoring**
   ```python
   # Answer all correct answers → Full points
   # Answer partial → 0 points (all-or-nothing)
   # Answer with extras → 0 points
   ```

3. **Test Free Text Scoring**
   ```python
   # Exact match → 1.0
   # Contains keywords → 0.5
   # No match → 0.0
   ```

### Frontend Testing

1. **Create Quiz**
   - Navigate to `/quizzes/create`
   - Add questions of each type
   - Verify form validation

2. **Take Quiz**
   - Navigate to `/quizzes/:id/take`
   - Test single choice radio buttons
   - Test multiple choice checkboxes
   - Test free text textarea
   - Verify timer (if set)

3. **View Results**
   - Navigate to quiz results page
   - Verify scoring for each question type
   - Check detailed feedback

---

## Migration from Old System

If upgrading from a system with `TRUE_FALSE` and `ESSAY` types:

1. **Map Old Types:**
   - `TRUE_FALSE` → `SINGLE_CHOICE` (2 options)
   - `ESSAY` → `FREE_TEXT`

2. **Update Database:**
   ```sql
   UPDATE questions SET question_type = 'single_choice' WHERE question_type = 'true_false';
   UPDATE questions SET question_type = 'free_text' WHERE question_type = 'essay';
   ```

3. **Update Frontend References:**
   - Replace `QuestionType.TRUE_FALSE` → `QuestionType.SINGLE_CHOICE`
   - Replace `QuestionType.ESSAY` → `QuestionType.FREE_TEXT`

---

## Troubleshooting

### Issue: Grila questions scoring incorrectly

**Solution:** Ensure `options` field is properly populated as array of strings:
```json
"options": ["A", "B", "C"]  // ✓ Correct
"options": "A,B,C"           // ✗ Wrong
```

### Issue: Free text answers not matching

**Solution:** 
1. Check `evaluation_criteria` is valid JSON array
2. Verify keyword matching is case-insensitive
3. Check `correct_answers` array has at least one entry

### Issue: Timer not working

**Solution:** Ensure `time_limit` is set (in minutes) and > 0

---

## Performance Considerations

- **Free Text Scoring:** Uses keyword matching (O(n) complexity)
- **Multiple Choice:** Uses set comparison (O(n) complexity)
- **Database:** Consider indexing `question_type` and `quiz_id` for better query performance

---

## Future Enhancements

1. **AI-Powered Evaluation:** Use OpenAI/Claude for libre text scoring
2. **Partial Credit:** Allow flexible grading for multiple choice
3. **Image Support:** Questions with embedded images
4. **Explanations:** Detailed explanations for incorrect answers
5. **Analytics:** Track student performance by question type

---

## References

- Backend API: `/roedu-backend/src/api/v1/quizzes.py`
- Models: `/roedu-backend/src/models/quiz.py`
- Frontend Components: `/roedu-frontend/src/app/components/quizzes/`
- Quiz Service: `/roedu-frontend/src/app/services/quiz.service.ts`

---

## Support

For issues or questions, refer to:
1. This guide
2. Backend README at `/roedu-backend/README.md`
3. Frontend README at `/roedu-frontend/README.md`
