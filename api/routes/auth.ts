import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db';
import jwt from 'jsonwebtoken';

const router = Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, name, user_type } = req.body;

    if (!email || !password || !name || !user_type) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (user_type !== 'donor' && user_type !== 'organization') {
        return res.status(400).json({ message: 'Invalid user type.' });
    }

    try {
        const existingUser = await query('SELECT email FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await query(
            'INSERT INTO users (email, password_hash, name, user_type) VALUES ($1, $2, $3, $4) RETURNING id, email, name, user_type',
            [email, password_hash, name, user_type]
        );

        const newUser = result.rows[0];

        res.status(201).json({ 
            message: 'Registration successful. Please log in.', 
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                user_type: newUser.user_type,
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const result = await query(
            'SELECT id, email, password_hash, name, user_type FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                user_type: user.user_type,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

export default router;