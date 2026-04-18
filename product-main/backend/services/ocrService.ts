import { createAIService } from './aiService';
import { examRepository } from '../repositories/exams';
import { questionRepository } from '../repositories/questions';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3';
import { Readable } from 'stream';

class OCRService {
  private aiService = createAIService();

  /**
   * Process exam OCR and extract questions
   * @param examId - Exam ID to process
   * @param s3Key - S3 key of the uploaded file
   */
  async processExamOCR(examId: string, s3Key: string): Promise<void> {
    try {
      // Update exam status to processing
      await examRepository.update(examId, { status: 'processing' });

      // Get file from S3
      const fileBuffer = await this.getFileFromS3(s3Key);

      // Perform OCR
      const ocrText = await this.aiService.ocr(fileBuffer, {
        language: 'zh',
        outputFormat: 'text'
      });

      // Extract questions from OCR text
      const questions = this.extractQuestions(ocrText);

      // Save questions to database
      for (let i = 0; i < questions.length; i++) {
        await questionRepository.create({
          examId,
          content: questions[i],
          answer: '',
          questionType: 'short_answer',
          difficulty: 'medium',
          knowledgePoint: '',
          orderIndex: i
        });
      }

      // Update exam status and question count
      await examRepository.update(examId, {
        status: 'recognized',
        questionCount: questions.length
      });

      console.log(`OCR processing completed for exam ${examId} - ${questions.length} questions extracted`);
    } catch (error) {
      console.error('OCR processing failed:', error);
      // Update exam status to failed
      await examRepository.update(examId, { status: 'failed' });
      throw error;
    }
  }

  /**
   * Get file from S3 as Buffer
   */
  private async getFileFromS3(s3Key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key
    });

    const response = await s3Client.send(command);
    const stream = response.Body as Readable;

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Extract questions from OCR text
   * This is a simple implementation - you may need to enhance it based on your exam format
   */
  private extractQuestions(text: string): string[] {
    const questions: string[] = [];
    const lines = text.split('\n');
    let currentQuestion = '';
    let inQuestion = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for question number pattern (e.g., "1.", "问题1", "第1题")
      if (trimmedLine.match(/^\d+\.|^问题\d+|^第\d+题/)) {
        if (currentQuestion) {
          questions.push(currentQuestion.trim());
          currentQuestion = '';
        }
        currentQuestion = trimmedLine;
        inQuestion = true;
      } else if (inQuestion && trimmedLine) {
        currentQuestion += ' ' + trimmedLine;
      } else if (inQuestion && !trimmedLine) {
        // End of question
        questions.push(currentQuestion.trim());
        currentQuestion = '';
        inQuestion = false;
      }
    }

    // Add the last question if it exists
    if (currentQuestion) {
      questions.push(currentQuestion.trim());
    }

    return questions;
  }
}

export const ocrService = new OCRService();
export default OCRService;