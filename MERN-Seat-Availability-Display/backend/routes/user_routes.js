const express = require('express');
const { verifyUser } = require('../middleware/authMiddleware'); // Ensure this path is correct
const UserModel = require('../models/User');
const router = express.Router();

// Get user profile
router.get('/profile', verifyUser, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

module.exports = router; // Ensure you export the router
