import { Router, Request, Response, NextFunction } from 'express';
import { examRepository } from '../repositories/exams';
import { questionRepository } from '../repositories/questions';
import { insertExamSchema, updateExamSchema } from '../db/schema';
import { AppError } from '../middleware/errorHandler';
import { ocrService } from '../services/ocrService';

const router = Router();

// GET /api/exams
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, grade, year, semester, status, search, page, limit } = req.query;
    const result = await examRepository.findAll({
      subject: subject as string,
      grade: grade as string,
      year: year ? parseInt(year as string) : undefined,
      semester: semester as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await examRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const exam = await examRepository.findById(id);
    if (!exam) throw new AppError('Exam not found', 404);
    res.json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
});

// GET /api/exams/:id/questions
router.get('/:id/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const qs = await questionRepository.findByExamId(id);
    res.json({ success: true, data: qs });
  } catch (error) {
    next(error);
  }
});

// POST /api/exams
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = insertExamSchema.parse(req.body);
    const exam = await examRepository.create(validated);
    
    // Trigger OCR processing in background
    if (validated.s3Key) {
      ocrService.processExamOCR(exam.id, validated.s3Key)
        .catch(error => {
          console.error('OCR processing failed for exam', exam.id, error);
        });
    }
    
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/exams/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validated = updateExamSchema.parse(req.body);
    const exam = await examRepository.update(id, validated);
    if (!exam) throw new AppError('Exam not found', 404);
    res.json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/exams/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const deleted = await examRepository.delete(id);
    if (!deleted) throw new AppError('Exam not found', 404);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
