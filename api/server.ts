import express, { Request, Response } from 'express';
import { query } from './db'; 
import cors from 'cors'; 
import 'dotenv/config'; 
import authRouter from './routes/auth';
import authMiddleware from './middleware/authMiddleware'; 
import donationsRouter from './routes/donations';
import profilesRouter from './routes/profiles';

interface AuthRequest extends Request {
    user?: { id: string, user_type: string };
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/donations', donationsRouter); 
app.use('/api/profiles', profilesRouter); 

app.get('/', (req: Request, res: Response) => {
    res.send('ShareMyThali API is running.');
});

app.get('/test-db', async (req: Request, res: Response) => {
    try {
        const result = await query<{ now: string }>('SELECT NOW()');
        res.status(200).json({ 
            message: 'Database connection successful!',
            timestamp: result.rows[0].now 
        });
    } catch (error: any) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'Database connection failed.', error: error.message });
    }
});

app.get('/api/protected/me', authMiddleware, (req: AuthRequest, res: Response) => {
    res.status(200).json({ 
        message: 'Successfully accessed protected route.',
        user: req.user 
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});