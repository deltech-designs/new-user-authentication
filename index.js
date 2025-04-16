import express from 'express';
import { connectDB } from './config/db.js'; // This import is now correct
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Database connection
connectDB().then(() => {
  // Routes
  app.use('/api/v1', router);
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
