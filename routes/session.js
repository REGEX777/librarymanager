import express from 'express';
import useragent from 'useragent';
const router = express.Router();

// model
import Session from '../models/Session.js';

// middleware
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { checkSession } from '../middleware/checksession.js';

router.get('/', checkSession, isLoggedIn, async (req, res) => {
    const sessions = await Session.find({ userId: req.user._id });

    res.render('sessions', { sessions, sessionData: req.sessionData,  csrfToken: req.csrfToken() });
});

router.post('/logout',  async (req, res, next) => {
    try {
        const sessionKey = req.body.sessionKey;
        console.log('Session Key:', sessionKey);

        // Get current device info
        const agent = useragent.parse(req.headers['user-agent']);
        const currentDeviceInfo = `${agent.family} on ${agent.os.family}`;
        const currentIpAddress = req.ip;

        // Find the session to delete
        const sessionToDelete = await Session.findOne({
            userId: req.user._id,
            key: sessionKey
        });

        if (!sessionToDelete) {
            return res.status(404).send('Session not found.');
        }

        // Check if the session belongs to the current device
        if (sessionToDelete.deviceInfo === currentDeviceInfo && sessionToDelete.ipAddress === currentIpAddress) {
            // If the session is from the current device log the user out
            await Session.deleteOne({ _id: sessionToDelete._id });

            req.logout(function (err) {
                if (err) {
                    return next(err);
                }

                res.clearCookie('connect.sid');
                res.redirect('/login');
            });
        } else {
            // If the session is from a different device, only delete that session
            await Session.deleteOne({
                userId: req.user._id,
                key: sessionKey
            });

            res.redirect('/sessions')
        }

    } catch (error) {
        console.error('Error during logout session removal:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});


export default router;