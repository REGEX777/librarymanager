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
    res.render('login');
});

router.post('/', validateEmail, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), async (req, res) => {
    try {
        const agent = useragent.parse(req.headers['user-agent']);
        const deviceInfo = `${agent.family} on ${agent.os.family}`;
        const ipAddress = req.ip;

        const existingSession = await Session.findOne({
            userId: req.user._id,
            ipAddress,
            deviceInfo
        });

        if (!existingSession) {
            // new session only if one doesnt exist
            const session = new Session({
                userId: req.user._id,
                ipAddress,
                deviceInfo
            });
            await session.save();
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).send('An error occurred while creating the session.');
    }
});
export default router;
