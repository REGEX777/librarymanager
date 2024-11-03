import express from 'express';

const router = express.Router();

// middleware import
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { isAdmin } from '../middleware/isAdmin.js';


router.get('/', isLoggedIn, isAdmin, (req, res)=>{
    res.render('admin')
})

export default router;