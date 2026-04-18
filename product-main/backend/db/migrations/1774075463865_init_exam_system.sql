-- Migration: Initialize Exam Organizer System

CREATE TABLE IF NOT EXISTS "uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "upload_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "file_type" text NOT NULL,
  "s3_key" text NOT NULL,
  "s3_url" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "exams" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "subject" text NOT NULL,
  "grade" text NOT NULL DEFAULT '',
  "year" integer NOT NULL,
  "semester" text NOT NULL DEFAULT '',
  "file_type" text NOT NULL DEFAULT 'pdf',
  "file_size" integer NOT NULL DEFAULT 0,
  "file_path" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'processing',
  "question_count" integer NOT NULL DEFAULT 0,
  "is_shared" boolean NOT NULL DEFAULT false,
  "shared_by" text,
  "uploaded_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "exam_id" uuid NOT NULL REFERENCES "exams"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "answer" text NOT NULL DEFAULT '',
  "question_type" text NOT NULL DEFAULT 'short_answer',
  "difficulty" text NOT NULL DEFAULT 'medium',
  "knowledge_point" text NOT NULL DEFAULT '',
  "order_index" integer NOT NULL DEFAULT 0,
  "is_wrong" boolean NOT NULL DEFAULT false,
  "wrong_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "shared_resources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "resource_type" text NOT NULL DEFAULT 'exam',
  "resource_id" uuid NOT NULL,
  "shared_by" text NOT NULL DEFAULT '璟延 李',
  "shared_by_name" text NOT NULL DEFAULT '璟延 李',
  "description" text NOT NULL DEFAULT '',
  "shared_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "exams_subject_idx" ON "exams"("subject");
CREATE INDEX IF NOT EXISTS "exams_status_idx" ON "exams"("status");
CREATE INDEX IF NOT EXISTS "exams_year_idx" ON "exams"("year");
CREATE INDEX IF NOT EXISTS "questions_exam_id_idx" ON "questions"("exam_id");
CREATE INDEX IF NOT EXISTS "questions_is_wrong_idx" ON "questions"("is_wrong");
CREATE INDEX IF NOT EXISTS "questions_subject_idx" ON "questions"("knowledge_point");
