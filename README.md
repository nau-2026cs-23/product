# 试卷整理系统 - ExamOrganizer Pro

A full-stack exam management system for teachers and students to upload, organize, search, and share exam papers with OCR recognition.

## Project Structure

```
.
├── backend/
│   ├── config/           # App configuration (constants, S3)
│   ├── db/
│   │   ├── index.ts      # Database connection (postgres.js + Drizzle)
│   │   ├── schema.ts     # DB schema: uploads, exams, questions, sharedResources
│   │   └── migrations/   # SQL migration files
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   ├── exams.ts      # Exam CRUD + stats
│   │   ├── questions.ts  # Question CRUD + wrong-question queries
│   │   ├── shares.ts     # Shared resource CRUD
│   │   └── upload.ts     # File upload handling
│   ├── routes/
│   │   ├── exams.ts      # GET/POST/PATCH/DELETE /api/exams
│   │   ├── questions.ts  # GET/POST/PATCH/DELETE /api/questions
│   │   ├── shares.ts     # GET/POST/DELETE /api/shares
│   │   ├── upload.ts     # File upload routes
│   │   └── speech.ts     # Speech routes
│   ├── services/
│   │   └── aiService.ts  # AI/OCR service integration
│   └── server.ts         # Express entry point
├── frontend/
│   └── src/
│       ├── lib/
│       │   └── api.ts    # examApi, questionApi, shareApi clients
│       ├── pages/
│       │   ├── Index.tsx           # App shell: sidebar nav + routing
│       │   ├── ExamsView.tsx       # Exam list, upload, filters, stats
│       │   ├── QuestionsView.tsx   # Question bank, edit, mark wrong, export
│       │   ├── WrongQuestionsView.tsx # Wrong question notebook
│       │   ├── ShareView.tsx       # Sharing & collaboration
│       │   └── AnalyticsView.tsx   # Data analytics dashboard
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css     # Tailwind v4 theme (Minimal Scholar style)
├── shared/types/
│   └── api.ts            # Shared types: Exam, Question, SharedResource, etc.
└── drizzle.config.ts
```

## Tech Stack

- **Backend**: Express.js + TypeScript + Drizzle ORM + postgres.js
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL
- **File Storage**: AWS S3 (presigned URLs)

## Key Features

1. **试卷管理** - Upload PDF/JPG/PNG exams with metadata (subject, grade, year, semester)
2. **OCR识别** - Automatic question extraction with status tracking (recognized/processing/failed)
3. **题目库** - Browse, search, filter, and edit individual questions
4. **错题本** - Mark questions as wrong, review wrong question notebook
5. **搜索筛选** - Filter by subject, semester, year, status, difficulty, question type
6. **分享协作** - Share exams with colleagues, team resource management
7. **数据分析** - Subject distribution, OCR accuracy, upload trends
8. **批量导出** - Export selected questions as PDF exam papers

## API Routes

- `GET/POST /api/exams` - List/create exams
- `GET /api/exams/stats` - Exam statistics
- `GET/PATCH/DELETE /api/exams/:id` - Exam operations
- `GET /api/exams/:id/questions` - Questions for an exam
- `GET/POST /api/questions` - List/create questions
- `GET /api/questions/wrong` - Wrong questions list
- `PATCH /api/questions/:id/wrong` - Mark/unmark wrong
- `GET/POST/DELETE /api/shares` - Shared resources

## Database Tables

- `uploads` - File upload records
- `exams` - Exam papers with metadata and OCR status
- `questions` - Individual questions extracted from exams
- `shared_resources` - Shared exam/question-set records

## Code Generation Guidelines

- All shared types in `shared/types/api.ts`, import with `@shared/types/api`
- Frontend API calls via `frontend/src/lib/api.ts` (examApi, questionApi, shareApi)
- Navigation state managed in `Index.tsx` via `useState<View>`
- No authentication — all routes are public
- Repository pattern: routes → repositories → Drizzle ORM
- Zod validation at route boundary, type assertion `as InsertX` in repository `.values()`
