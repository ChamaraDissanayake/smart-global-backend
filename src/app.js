require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const routes = require('./routes/index');
const errorHandler = require('./middleware/error');
const path = require('path');

const app = express();

app.set('trust proxy', 1);

app.get("/test", (req, res) => {
    res.send("Chamara API working");
});

// Initialize database
initDB().then(() => {
    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api', routes);

    // Error handling
    app.use(errorHandler);

    // View images
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Start server
    // const PORT = process.env.PORT || 3000;
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("🚀 Server initialized and middleware applied.");
}).catch(err => {
    console.error("❌ Database connection failed:", err);
});

module.exports = app;