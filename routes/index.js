import { Router } from 'express';
import authRoutes from './userRoutes.js'; // Import user routes

const router = Router();

router.use('/auth', authRoutes); // Base path is /api/auth

export default router;
