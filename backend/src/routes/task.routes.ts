import { Router } from 'express';
import * as taskCtrl from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', taskCtrl.getTasks);
router.post('/', taskCtrl.createTask);
router.patch('/:id', taskCtrl.updateTask);
router.delete('/:id', taskCtrl.deleteTask);
router.patch('/:id/toggle', taskCtrl.toggleTask);

export default router;