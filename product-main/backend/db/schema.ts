import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ─── Uploads (existing) ───────────────────────────────────────────────────────

export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadId: text('upload_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  s3Key: text('s3_key').notNull(),
  s3Url: text('s3_url').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads, {
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  s3Key: z.string().min(1),
  s3Url: z.string().min(1),
  uploadId: z.string().min(1),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

// ─── Exams ────────────────────────────────────────────────────────────────────

export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  grade: text('grade').notNull().default(''),
  year: integer('year').notNull(),
  semester: text('semester').notNull().default(''),
  fileType: text('file_type').notNull().default('pdf'),
  fileSize: integer('file_size').notNull().default(0),
  filePath: text('file_path').notNull().default(''),
  s3Key: text('s3_key').default(''),
  status: text('status').notNull().default('processing'),
  questionCount: integer('question_count').notNull().default(0),
  isShared: boolean('is_shared').notNull().default(false),
  sharedBy: text('shared_by'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertExamSchema = createInsertSchema(exams, {
  title: z.string().min(1),
  subject: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const updateExamSchema = insertExamSchema.partial();

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

// ─── Questions ────────────────────────────────────────────────────────────────

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  examId: uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  answer: text('answer').notNull().default(''),
  questionType: text('question_type').notNull().default('short_answer'),
  difficulty: text('difficulty').notNull().default('medium'),
  knowledgePoint: text('knowledge_point').notNull().default(''),
  orderIndex: integer('order_index').notNull().default(0),
  isWrong: boolean('is_wrong').notNull().default(false),
  wrongCount: integer('wrong_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions, {
  content: z.string().min(1),
  examId: z.string().uuid(),
});

export const updateQuestionSchema = insertQuestionSchema.partial();

export type QuestionRow = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// ─── Shared Resources ─────────────────────────────────────────────────────────

export const sharedResources = pgTable('shared_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceType: text('resource_type').notNull().default('exam'),
  resourceId: uuid('resource_id').notNull(),
  sharedBy: text('shared_by').notNull().default('璟延 李'),
  sharedByName: text('shared_by_name').notNull().default('璟延 李'),
  description: text('description').notNull().default(''),
  sharedAt: timestamp('shared_at').defaultNow().notNull(),
});

export const insertSharedResourceSchema = createInsertSchema(sharedResources, {
  resourceId: z.string().uuid(),
});

export type SharedResource = typeof sharedResources.$inferSelect;
export type InsertSharedResource = typeof sharedResources.$inferInsert;
