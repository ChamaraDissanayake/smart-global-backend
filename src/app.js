import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middleware/error.js';

const app = express();

// Initialize database
await initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;