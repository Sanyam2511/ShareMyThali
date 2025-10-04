import { Router, Request, Response } from 'express';
import { query } from '../db';
import authMiddleware from '../middleware/authMiddleware';

interface AuthRequest extends Request {
    user?: { id: string, user_type: string };
}

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { title, description, quantity_details, pickup_address, latitude, longitude, expiry_time } = req.body;
    const donorId = req.user?.id;
    const userType = req.user?.user_type;

    if (userType !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can create a donation.' });
    }

    if (!title || !pickup_address || !latitude || !longitude || !quantity_details) {
        return res.status(400).json({ message: 'Missing required fields: title, address, coordinates, or quantity details.' });
    }

    try {
        const result = await query(
            `INSERT INTO food_donations 
            (donor_id, title, description, quantity_details, pickup_address, latitude, longitude, expiry_time) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [donorId, title, description, quantity_details, pickup_address, latitude, longitude, expiry_time]
        );

        res.status(201).json({ 
            message: 'Donation created successfully.', 
            donation: result.rows[0] 
        });
    } catch (error) {
        console.error('Donation creation error:', error);
        res.status(500).json({ message: 'Internal server error while creating donation.' });
    }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const userType = req.user?.user_type;
    const userId = req.user?.id;
    
    try {
        let sql: string;
        let params: any[] = [];

        if (userType === 'organization') {
            sql = 'SELECT * FROM food_donations WHERE status = $1 ORDER BY created_at DESC';
            params = ['available'];
        } else if (userType === 'donor') {
            sql = 'SELECT * FROM food_donations WHERE donor_id = $1 ORDER BY created_at DESC';
            params = [userId];
        } else {
            return res.status(403).json({ message: 'Access denied. Invalid user type.' });
        }

        const result = await query(sql, params);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Fetch donations error:', error);
        res.status(500).json({ message: 'Internal server error while fetching donations.' });
    }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    const donationId = req.params.id;
    
    try {
        const result = await query('SELECT * FROM food_donations WHERE id = $1', [donationId]);
        const donation = result.rows[0];

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }
        
        if (req.user?.user_type === 'donor' && donation.donor_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.status(200).json(donation);

    } catch (error) {
        console.error('Fetch single donation error:', error);
        res.status(500).json({ message: 'Internal server error while fetching donation.' });
    }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    const donationId = req.params.id;
    const donorId = req.user?.id;
    const { title, description, quantity_details, pickup_address, latitude, longitude, expiry_time } = req.body;

    if (req.user?.user_type !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can modify donations.' });
    }

    try {
        const checkResult = await query('SELECT donor_id, status FROM food_donations WHERE id = $1', [donationId]);
        const donation = checkResult.rows[0];

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }
        if (donation.donor_id !== donorId) {
            return res.status(403).json({ message: 'Access denied. You do not own this donation.' });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({ message: `Cannot update donation with status: ${donation.status}.` });
        }

        const result = await query(
            `UPDATE food_donations SET 
            title = COALESCE($1, title), 
            description = COALESCE($2, description), 
            quantity_details = COALESCE($3, quantity_details),
            pickup_address = COALESCE($4, pickup_address),
            latitude = COALESCE($5, latitude),
            longitude = COALESCE($6, longitude),
            expiry_time = COALESCE($7, expiry_time),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $8 RETURNING *`,
            [title, description, quantity_details, pickup_address, latitude, longitude, expiry_time, donationId]
        );

        res.status(200).json({ 
            message: 'Donation updated successfully.', 
            donation: result.rows[0] 
        });
    } catch (error) {
        console.error('Donation update error:', error);
        res.status(500).json({ message: 'Internal server error while updating donation.' });
    }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    const donationId = req.params.id;
    const donorId = req.user?.id;

    if (req.user?.user_type !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can cancel donations.' });
    }

    try {
        const checkResult = await query('SELECT donor_id, status FROM food_donations WHERE id = $1', [donationId]);
        const donation = checkResult.rows[0];

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }
        if (donation.donor_id !== donorId) {
            return res.status(403).json({ message: 'Access denied. You do not own this donation.' });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({ message: `Cannot cancel donation with status: ${donation.status}.` });
        }

        await query('UPDATE food_donations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['cancelled', donationId]);

        res.status(200).json({ message: 'Donation successfully cancelled.' });

    } catch (error) {
        console.error('Donation cancellation error:', error);
        res.status(500).json({ message: 'Internal server error while cancelling donation.' });
    }
});

router.patch('/:id/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
    const donationId = req.params.id;
    const organizationId = req.user?.id;

    if (req.user?.user_type !== 'organization') {
        return res.status(403).json({ message: 'Access denied. Only organizations can claim donations.' });
    }

    try {
        const checkResult = await query('SELECT status, donor_id FROM food_donations WHERE id = $1', [donationId]);
        const donation = checkResult.rows[0];

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({ message: `Donation is already ${donation.status}. Cannot claim.` });
        }
        if (donation.donor_id === organizationId) {
            return res.status(400).json({ message: 'An organization cannot claim a donation from itself.' });
        }

        const result = await query(
            'UPDATE food_donations SET status = $1, organization_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            ['pending', organizationId, donationId]
        );

        res.status(200).json({ 
            message: 'Donation successfully claimed. Pickup is pending confirmation by the donor.', 
            donation: result.rows[0] 
        });

    } catch (error) {
        console.error('Donation claim error:', error);
        res.status(500).json({ message: 'Internal server error while claiming donation.' });
    }
});

router.patch('/:id/fulfill', authMiddleware, async (req: AuthRequest, res: Response) => {
    const donationId = req.params.id;
    const donorId = req.user?.id;

    if (req.user?.user_type !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only the donor can confirm fulfillment.' });
    }

    try {
        const checkResult = await query('SELECT donor_id, status FROM food_donations WHERE id = $1', [donationId]);
        const donation = checkResult.rows[0];

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }
        if (donation.donor_id !== donorId) {
            return res.status(403).json({ message: 'Access denied. You do not own this donation.' });
        }
        if (donation.status !== 'pending') {
            return res.status(400).json({ message: `Donation status is ${donation.status}. It must be 'pending' to fulfill.` });
        }

        await query('UPDATE food_donations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['fulfilled', donationId]);

        res.status(200).json({ message: 'Donation successfully fulfilled.' });

    } catch (error) {
        console.error('Donation fulfillment error:', error);
        res.status(500).json({ message: 'Internal server error while fulfilling donation.' });
    }
});

export default router;