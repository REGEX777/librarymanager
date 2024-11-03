import express from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import flash from 'express-flash';


// import model
import User from '../models/User.js';

const router = express.Router();

// middleware import
import { validateEmail } from '../middleware/emailValidator.js';
import { isLoggedOut } from '../middleware/isLoggedOut.js';

// route get
router.get('/', isLoggedOut, (req, res)=>{
    res.render('signup')
})

// route post
router.post('/', validateEmail, isLoggedOut, async (req, res)=>{
    const existingUser = await User.findOne({
        email: req.body.email
    });
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const errorMessages = errors.array().map(error=>error.msg)
        req.flash('error', errorMessages);
        return res.redirect('/signup')
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
    })

    await newUser.save();

    req.login(newUser, err=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/")
        }
    })
})


export default router;