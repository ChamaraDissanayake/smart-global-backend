import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middleware/error.js';
import path from 'path';

const app = express();

async function startServer() {
    try {
        // Initialize database
        await initDB();
        console.log('Database connected successfully.');

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Routes
        app.use('/api', routes);

        // Error handling
        app.use(errorHandler);

        // Serve uploaded images
        app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Exit the process on failure
    }
}

// Start the server
startServer();

export default app;