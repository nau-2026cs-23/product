import { Router, Request, Response, NextFunction } from 'express';
import { questionRepository } from '../repositories/questions';
import { insertQuestionSchema, updateQuestionSchema } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/questions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { examId, difficulty, questionType, knowledgePoint, isWrong, search, page, limit } = req.query;
    const result = await questionRepository.findAll({
      examId: examId as string,
      difficulty: difficulty as string,
      questionType: questionType as string,
      knowledgePoint: knowledgePoint as string,
      isWrong: isWrong === 'true' ? true : isWrong === 'false' ? false : undefined,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/questions/wrong
router.get('/wrong', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await questionRepository.getWrongQuestions({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/questions/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const q = await questionRepository.findById(id);
    if (!q) throw new AppError('Question not found', 404);
    res.json({ success: true, data: q });
  } catch (error) {
    next(error);
  }
});

// POST /api/questions
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = insertQuestionSchema.parse(req.body);
    const q = await questionRepository.create(validated);
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/questions/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validated = updateQuestionSchema.parse(req.body);
    const q = await questionRepository.update(id, validated);
    if (!q) throw new AppError('Question not found', 404);
    res.json({ success: true, data: q });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/questions/:id/wrong
router.patch('/:id/wrong', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { isWrong } = req.body;
    const q = await questionRepository.markWrong(id, Boolean(isWrong));
    if (!q) throw new AppError('Question not found', 404);
    res.json({ success: true, data: q });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const deleted = await questionRepository.delete(id);
    if (!deleted) throw new AppError('Question not found', 404);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
});

// GET /api/questions/stats
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await questionRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
