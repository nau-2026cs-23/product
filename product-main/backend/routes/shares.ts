import { Router, Request, Response, NextFunction } from 'express';
import { shareRepository } from '../repositories/shares';
import { insertSharedResourceSchema } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/shares
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const shares = await shareRepository.findAll();
    res.json({ success: true, data: shares });
  } catch (error) {
    next(error);
  }
});

// POST /api/shares
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { resourceType?: string; resourceId?: string; description?: string; sharedBy?: string; sharedByName?: string };
    const validated = insertSharedResourceSchema.parse(body);
    const share = await shareRepository.create(validated);
    res.status(201).json({ success: true, data: share });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/shares/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const deleted = await shareRepository.delete(id);
    if (!deleted) throw new AppError('Share not found', 404);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
