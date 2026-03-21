import { db } from '../db';
import { questions, exams, QuestionRow, InsertQuestion, insertQuestionSchema, updateQuestionSchema } from '../db/schema';
import { eq, ilike, and, SQL, desc } from 'drizzle-orm';
import { z } from 'zod';

type CreateQuestionInput = z.infer<typeof insertQuestionSchema>;
type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export class QuestionRepository {
  async findAll(filters?: {
    examId?: string;
    subject?: string;
    difficulty?: string;
    questionType?: string;
    knowledgePoint?: string;
    isWrong?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];

    if (filters?.examId) conditions.push(eq(questions.examId, filters.examId));
    if (filters?.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty));
    if (filters?.questionType) conditions.push(eq(questions.questionType, filters.questionType));
    if (filters?.knowledgePoint) conditions.push(ilike(questions.knowledgePoint, `%${filters.knowledgePoint}%`));
    if (filters?.isWrong !== undefined) conditions.push(eq(questions.isWrong, filters.isWrong));
    if (filters?.search) conditions.push(ilike(questions.content, `%${filters.search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(questions)
      .where(whereClause)
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    const countRows = await db.select().from(questions).where(whereClause);

    return { questions: rows, total: countRows.length, page, limit };
  }

  async findById(id: string): Promise<QuestionRow | undefined> {
    const [q] = await db.select().from(questions).where(eq(questions.id, id));
    return q;
  }

  async findByExamId(examId: string): Promise<QuestionRow[]> {
    return db.select().from(questions).where(eq(questions.examId, examId));
  }

  async create(data: CreateQuestionInput): Promise<QuestionRow> {
    const [q] = await db.insert(questions).values(data as InsertQuestion).returning();
    return q;
  }

  async update(id: string, data: UpdateQuestionInput): Promise<QuestionRow | undefined> {
    const [q] = await db
      .update(questions)
      .set({ ...data as Partial<InsertQuestion>, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return q;
  }

  async markWrong(id: string, isWrong: boolean): Promise<QuestionRow | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;
    const wrongCount = isWrong ? existing.wrongCount + 1 : existing.wrongCount;
    const [q] = await db
      .update(questions)
      .set({ isWrong, wrongCount, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return q;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(questions).where(eq(questions.id, id)).returning();
    return result.length > 0;
  }

  async getWrongQuestions(filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(questions)
      .where(eq(questions.isWrong, true))
      .orderBy(desc(questions.updatedAt))
      .limit(limit)
      .offset(offset);

    const countRows = await db.select().from(questions).where(eq(questions.isWrong, true));
    return { questions: rows, total: countRows.length, page, limit };
  }
}

export const questionRepository = new QuestionRepository();
