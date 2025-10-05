import { Router, Request, Response } from 'express';
import { query } from '../db';
import authMiddleware from '../middleware/authMiddleware';

// Re-declare the AuthRequest interface
interface AuthRequest extends Request {
    user?: { id: string, user_type: string };
}

const router = Router();

// ====================================================================
// A. GET /api/profiles/me - View Own Profile
// ====================================================================
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const userType = req.user?.user_type;

    try {
        // Fetch user data from the 'users' table
        const userResult = await query(
            'SELECT id, email, name, user_type, phone_number, created_at FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        let profileData = { ...user };

        // If the user is an organization, fetch their profile details as well
        if (userType === 'organization') {
            const orgResult = await query(
                'SELECT registration_number, contact_person, address_line_1, city, zip_code, is_verified FROM organization_profiles WHERE user_id = $1',
                [userId]
            );
            if (orgResult.rows[0]) {
                profileData = { ...profileData, ...orgResult.rows[0] };
            }
        }

        res.status(200).json(profileData);

    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ message: 'Internal server error while fetching profile.' });
    }
});


// ====================================================================
// B. PUT /api/profiles/me - Update Own Profile
// ====================================================================
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const userType = req.user?.user_type;
    const { name, phone_number, registration_number, contact_person, address_line_1, city, zip_code } = req.body;

    try {
        // 1. Update general 'users' table fields
        await query(
            `UPDATE users SET 
            name = COALESCE($1, name), 
            phone_number = COALESCE($2, phone_number),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $3`,
            [name, phone_number, userId]
        );

        // 2. If an Organization, update 'organization_profiles' table
        if (userType === 'organization') {
            const orgFields = [registration_number, contact_person, address_line_1, city, zip_code];

            // Only attempt to update if at least one organization-specific field is provided
            if (orgFields.some(field => field !== undefined)) {
                await query(
                    `INSERT INTO organization_profiles (user_id, registration_number, contact_person, address_line_1, city, zip_code)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (user_id) DO UPDATE SET
                    registration_number = COALESCE($2, organization_profiles.registration_number),
                    contact_person = COALESCE($3, organization_profiles.contact_person),
                    address_line_1 = COALESCE($4, organization_profiles.address_line_1),
                    city = COALESCE($5, organization_profiles.city),
                    zip_code = COALESCE($6, organization_profiles.zip_code)`,
                    [userId, registration_number, contact_person, address_line_1, city, zip_code]
                );
            }
        }
        
        res.status(200).json({ message: 'Profile updated successfully.' });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error while updating profile.' });
    }
});

export default router;