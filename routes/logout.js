import express from 'express';
import Session from '../models/Session.js'; // Import the Session model

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        console.log(req.ip)
        console.log(req.user._id)
        console.log(req.deviceInfo)
        await Session.deleteOne({
            userId: req.user._id,  
            ipAddress: req.ip,      
            deviceInfo: req.deviceInfo 
        });

        req.logout(function (err) {
            if (err) {
                return next(err);
            }

            // Clear the session cookie set by Passport
            res.clearCookie('connect.sid'); 

            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error during logout session removal:', error);
        res.status(500).send('An error occurred while logging out.');
    }
});
export default router;
