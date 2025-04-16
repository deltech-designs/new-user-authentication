import { Router } from 'express';
import authRoutes from './userRoutes.js';

const router = Router();
router.use('/', authRoutes); // Use the user routes under the /api path

export default router;
