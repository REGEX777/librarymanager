import express from 'express';
import Session from '../models/Session.js'; // Import the Session model

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const sessionKey = req.body.sessionKey 
        console.log(sessionKey)
        await Session.deleteOne({
            userId: req.user._id,  
            ipAddress: req.ip,      
            key: sessionKey
        });

        req.logout(function (err) {
            if (err) {
                return next(err);
            }

            res.clearCookie('connect.sid'); 

            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error during logout session removal:', error);
        res.status(500).send('An error occurred while logging out.');
    }
});
export default router;
