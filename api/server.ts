import express, { Request, Response } from 'express';
import { query } from './db'; 
import cors from 'cors'; 
import 'dotenv/config'; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        console.error('Database Connection Error:', error);
        res.status(500).json({ 
            message: 'Database connection failed.', 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});