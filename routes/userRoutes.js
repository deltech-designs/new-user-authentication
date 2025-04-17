import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
} from '../controllers/userController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerValidation,
  loginValidation,
} from '../middlewares/validation.js';

const router = Router();

router
  .route('/register')
  .post(registerValidation, validateRequest, registerUser);
router.route('/verify/:token').get(verifyEmail);
router.route('/login').post(loginValidation, validateRequest, loginUser);

export default router;
