

import { Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
} from '../controllers/userController.js'; // Adjust the import path as needed
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerValidation,
  loginValidation,
} from '../middlewares/validation.js';
const router = Router();
// Route for user registration
router
  .route('/register')
  .post(registerValidation, validateRequest, registerUser);
// Route for user login
router.route('/login').post(loginValidation, validateRequest, loginUser);
// Route for email verification
router.route('/verify/:token').get(verifyEmail);

export default router;
