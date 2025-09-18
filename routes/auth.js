const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async(req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: 'User registered!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ error: 'Invalid username' });

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        req.session.userId = user._id;
        // gửi cookie thủ công (không bắt buộc, express-session sẽ làm)
        res.cookie('sid', req.sessionID, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60
        });

        res.json({ message: 'Login successful!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('sid');
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});

// Protected route
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    res.json({ message: 'You are logged in', userId: req.session.userId });
});

module.exports = router;