import Session from '../models/Session.js';


export async function checkSession(req, res, next) {
    try {
        // If the user isn't logged in don't need to check the session
        if (!req.session.userId || !req.session.sessionKey) {
            return next(); // Skip session validation
        }

        // If the session exists, check the database
        const session = await Session.findOne({
            userId: req.session.userId,
            key: req.session.sessionKey
        });

        if (!session) {
            // If session doesn't exist, log the user out properly
            req.logout(function (err) {
                if (err) {
                    console.error('Error logging out:', err);
                    return next(err);
                }
                res.clearCookie('connect.sid');
                return res.redirect('/login'); 
            });
        } else {
            // If session exists, attach it to the request object
            req.sessionData = session;
            return next(); // Continue to the next middlewarr
        }
    } catch (error) {
        console.error('Error checking session:', error);
        return next(error); // Proceed to the next middleware with the error
    }
}