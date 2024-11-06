import express from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import flash from 'express-flash';
import crypto from 'crypto';
import useragent from 'useragent';
// import model
import User from '../models/User.js';

const router = express.Router();

import Session from '../models/Session.js';
// middleware import
import { validateEmail } from '../middleware/emailValidator.js';
import { isLoggedOut } from '../middleware/isLoggedOut.js';

// route get
router.get('/', isLoggedOut, (req, res)=>{
    res.render('signup' , { csrfToken: req.csrfToken() })
})

// route post
router.post('/', validateEmail, isLoggedOut, async (req, res) => {
    const existingUser = await User.findOne({
        email: req.body.email
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        req.flash('error', errorMessages);
        return res.redirect('/signup');
    }

    if (existingUser) {
        req.flash('error', 'Email is already in use.');
        return res.redirect('/signup');
    }

    const hash = await bcrypt.hash(req.body.password, 12);

    const newUser = new User({
        email: req.body.email,
        password: hash,
        admin: false
    });

    await newUser.save();

    req.login(newUser, async (err) => {
        if (err) {
            console.error('Error logging in user after signup:', err);
            return res.redirect('/login');
        }

        try {
            const sessionKey = crypto.randomBytes(32).toString('hex');

            const agent = useragent.parse(req.headers['user-agent']);
            const deviceInfo = `${agent.family} on ${agent.os.family}`;
            const ipAddress = req.ip;

            const session = new Session({
                userId: req.user._id,
                ipAddress,
                deviceInfo,
                key: sessionKey
            });
            await session.save();

            res.cookie('sessionKey', sessionKey, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24,
            });

            // Use sessionKey here, not key
            req.session.userId = req.user._id;
            req.session.sessionKey = sessionKey;
            
            res.redirect('/');
        } catch (error) {
            console.error('Error creating session during signup:', error);
            res.status(500).send('An error occurred while creating the session.');
        }
    });
});

export default router;