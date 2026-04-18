import { db } from '../db';
import { exams, questions, Exam, InsertExam, insertExamSchema, updateExamSchema } from '../db/schema';
import { eq, ilike, and, SQL, desc, count, sum } from 'drizzle-orm';
import { z } from 'zod';

type CreateExamInput = z.infer<typeof insertExamSchema>;
type UpdateExamInput = z.infer<typeof updateExamSchema>;

export class ExamRepository {
  async findAll(filters?: {
    subject?: string;
    grade?: string;
    year?: number;
    semester?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (filters?.subject) conditions.push(eq(exams.subject, filters.subject));
    if (filters?.grade) conditions.push(eq(exams.grade, filters.grade));
    if (filters?.year) conditions.push(eq(exams.year, filters.year));
    if (filters?.semester) conditions.push(eq(exams.semester, filters.semester));
    if (filters?.status) conditions.push(eq(exams.status, filters.status));
    if (filters?.search) conditions.push(ilike(exams.title, `%${filters.search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(exams)
      .where(whereClause)
      .orderBy(desc(exams.uploadedAt))
      .limit(limit)
      .offset(offset);

    const countRows = await db.select().from(exams).where(whereClause);

    return { exams: rows, total: countRows.length, page, limit };
  }

  async findById(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async create(data: CreateExamInput): Promise<Exam> {
    const [exam] = await db.insert(exams).values(data as InsertExam).returning();
    return exam;
  }

  async update(id: string, data: UpdateExamInput): Promise<Exam | undefined> {
    const [exam] = await db
      .update(exams)
      .set({ ...data as Partial<InsertExam>, updatedAt: new Date() })
      .where(eq(exams.id, id))
      .returning();
    return exam;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(exams).where(eq(exams.id, id)).returning();
    return result.length > 0;
  }

  async getStats() {
    const allExams = await db.select().from(exams);
    const total = allExams.length;
    const recognized = allExams.filter(e => e.status === 'recognized').length;
    const processing = allExams.filter(e => e.status === 'processing').length;
    const failed = allExams.filter(e => e.status === 'failed').length;
    const totalQuestions = allExams.reduce((sum, e) => sum + e.questionCount, 0);
    const shared = allExams.filter(e => e.isShared).length;

    // Get wrong questions count
    const [wrongCountResult] = await db
      .select({ count: count(questions.id) })
      .from(questions)
      .where(eq(questions.isWrong, true));
    const wrongCount = wrongCountResult.count || 0;

    const subjectMap: Record<string, number> = {};
    allExams.forEach(e => {
      subjectMap[e.subject] = (subjectMap[e.subject] || 0) + 1;
    });

    return { total, recognized, processing, failed, totalQuestions, wrongCount, shared, subjectMap };
  }
}

export const examRepository = new ExamRepository();
