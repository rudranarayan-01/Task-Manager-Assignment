import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { authenticateToken } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use('/tasks', taskRoutes); 

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
