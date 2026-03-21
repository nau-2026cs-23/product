import { API_BASE_URL } from '@/config/constants';
import type {
  ApiResponse,
  Exam,
  PaginatedExams,
  CreateExamRequest,
  UpdateExamRequest,
  ExamFilters,
  Question,
  PaginatedQuestions,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionFilters,
  SharedResource,
  CreateShareRequest,
  AnalyticsSummary,
} from '@shared/types/api';

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json() as Promise<ApiResponse<T>>;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

// ─── Exams ───────────────────────────────────────────────────────────────────────

export const examApi = {
  list: (filters?: ExamFilters) =>
    request<PaginatedExams>(`/api/exams${buildQuery(filters as Record<string, string | number | boolean | undefined> || {})}` ),

  stats: () => request<{ total: number; recognized: number; processing: number; failed: number; totalQuestions: number; subjectMap: Record<string, number> }>('/api/exams/stats'),

  get: (id: string) => request<Exam>(`/api/exams/${id}`),

  getQuestions: (id: string) => request<Question[]>(`/api/exams/${id}/questions`),

  create: (data: CreateExamRequest) =>
    request<Exam>('/api/exams', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateExamRequest) =>
    request<Exam>(`/api/exams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/api/exams/${id}`, { method: 'DELETE' }),
};

// ─── Questions ───────────────────────────────────────────────────────────────────

export const questionApi = {
  list: (filters?: QuestionFilters) =>
    request<PaginatedQuestions>(`/api/questions${buildQuery(filters as Record<string, string | number | boolean | undefined> || {})}`),

  wrong: (page?: number, limit?: number) =>
    request<PaginatedQuestions>(`/api/questions/wrong${buildQuery({ page, limit })}`),

  get: (id: string) => request<Question>(`/api/questions/${id}`),

  create: (data: CreateQuestionRequest) =>
    request<Question>('/api/questions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateQuestionRequest) =>
    request<Question>(`/api/questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  markWrong: (id: string, isWrong: boolean) =>
    request<Question>(`/api/questions/${id}/wrong`, { method: 'PATCH', body: JSON.stringify({ isWrong }) }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/api/questions/${id}`, { method: 'DELETE' }),
};

// ─── Shares ──────────────────────────────────────────────────────────────────────

export const shareApi = {
  list: () => request<SharedResource[]>('/api/shares'),

  create: (data: CreateShareRequest) =>
    request<SharedResource>('/api/shares', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/api/shares/${id}`, { method: 'DELETE' }),
};
