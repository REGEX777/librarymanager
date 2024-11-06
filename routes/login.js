import express from 'express';
import passport from 'passport';
import useragent from 'useragent';
import crypto from 'crypto';

const router = express.Router();

// model
import Session from '../models/Session.js';
import User from '../models/User.js'
// middleware
import { isLoggedOut } from '../middleware/isLoggedOut.js';
import { validateEmail } from '../middleware/emailValidator.js';

router.get('/', isLoggedOut, (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/', validateEmail, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), async (req, res) => {
    try {
        const agent = useragent.parse(req.headers['user-agent']);
        const deviceInfo = `${agent.family} on ${agent.os.family}`;
        const ipAddress = req.ip;

        // Find an existing session
        let session = await Session.findOne({
            userId: req.user._id,
            ipAddress,
            deviceInfo
        });

        let key;
        if (session) {
            // If session exists, use the existing key
            key = session.key;
        } else {
            // If no session exists create a new key and save a new session
            key = crypto.randomBytes(32).toString('hex');
            session = new Session({
                userId: req.user._id,
                ipAddress,
                deviceInfo,
                key
            });
            await session.save();
        }

        // Set the session key in a cookie
        res.cookie('sessionKey', key, {
            httpOnly: true, // Prevents access to cookie via JavaScript
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 1000 * 60 * 60 * 24,
        });

        // Save the userId and sessionKey in the session
        req.session.userId = req.user._id;
        req.session.sessionKey = key;

        res.redirect('/');
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).send('An error occurred while creating the session.');
    }
});

export default router;
