import Session from '../models/Session.js'; // Make sure to import your Session model

export async function isLoggedIn(req, res, next) { 
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next()
}