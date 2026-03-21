// Shared API types — single source of truth for frontend ↔ backend contracts.

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Exam Types ───────────────────────────────────────────────────────────────

export type ExamStatus = 'recognized' | 'processing' | 'failed';
export type FileType = 'pdf' | 'jpg' | 'png' | 'jpeg';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  year: number;
  semester: string;
  fileType: FileType;
  fileSize: number;
  filePath: string;
  status: ExamStatus;
  questionCount: number;
  uploadedAt: string;
  updatedAt: string;
  sharedBy?: string;
  isShared?: boolean;
}

export interface CreateExamRequest {
  title: string;
  subject: string;
  grade: string;
  year: number;
  semester: string;
  fileType: FileType;
  fileSize: number;
  filePath: string;
}

export interface UpdateExamRequest {
  title?: string;
  subject?: string;
  grade?: string;
  year?: number;
  semester?: string;
  status?: ExamStatus;
  questionCount?: number;
}

export interface ExamFilters {
  subject?: string;
  grade?: string;
  year?: number;
  semester?: string;
  status?: ExamStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedExams {
  exams: Exam[];
  total: number;
  page: number;
  limit: number;
}

// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType = 'single_choice' | 'multiple_choice' | 'fill_blank' | 'short_answer' | 'essay';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  grade: string;
  year: number;
  content: string;
  answer: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  knowledgePoint: string;
  orderIndex: number;
  isWrong: boolean;
  wrongCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  examId: string;
  content: string;
  answer: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  knowledgePoint: string;
  orderIndex: number;
}

export interface UpdateQuestionRequest {
  content?: string;
  answer?: string;
  questionType?: QuestionType;
  difficulty?: DifficultyLevel;
  knowledgePoint?: string;
  isWrong?: boolean;
}

export interface QuestionFilters {
  subject?: string;
  grade?: string;
  year?: number;
  questionType?: QuestionType;
  difficulty?: DifficultyLevel;
  knowledgePoint?: string;
  isWrong?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedQuestions {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
}

// ─── Share Types ──────────────────────────────────────────────────────────────

export interface SharedResource {
  id: string;
  resourceType: 'exam' | 'question_set';
  resourceId: string;
  resourceTitle: string;
  subject: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: string;
  description: string;
  questionCount: number;
}

export interface CreateShareRequest {
  resourceType: 'exam' | 'question_set';
  resourceId: string;
  description?: string;
  sharedWith?: string[];
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface SubjectStats {
  subject: string;
  examCount: number;
  questionCount: number;
  wrongCount: number;
  color: string;
}

export interface AnalyticsSummary {
  totalExams: number;
  totalQuestions: number;
  totalWrongQuestions: number;
  sharedResources: number;
  recognitionAccuracy: number;
  monthlyUploads: number;
  subjectStats: SubjectStats[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'share' | 'wrong_mark' | 'export';
  description: string;
  timestamp: string;
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export interface ExportRequest {
  questionIds: string[];
  title: string;
  format: 'pdf';
}
