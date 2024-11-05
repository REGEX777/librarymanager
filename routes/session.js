import express from 'express';

const router = express.Router();

// model
import Session from '../models/Session.js';

// middleware
import { isLoggedIn } from '../middleware/isLoggedIn.js';

router.get('/', isLoggedIn, async (req, res) => {
    const sessions = await Session.find({ userId: req.user._id, isActive: true });

    const currentSession = sessions.find(session => 
        session.ipAddress === req.ip && session.deviceInfo === req.headers['user-agent']
    );

    res.render('sessions', { sessions, currentSession });
});

router.post('/logout', isLoggedIn, async (req, res) => {
    const { sessionId } = req.body;

    await Session.findByIdAndUpdate(sessionId, { isActive: false });

    const activeSessions = await Session.find({ userId: req.user._id, isActive: true });

    if (activeSessions.length === 0) {
        req.logout(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.redirect('/sessions');  
            }
            return res.redirect('/login'); 
        });
    } else {
        return res.redirect('/sessions'); 
    }
});
export default router;
