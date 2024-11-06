import express from 'express';

const router = express.Router()

import Book from '../models/Book.js';
import {checkSession} from '../middleware/checksession.js'

router.get('/', checkSession, (req, res)=>{
    if(req.sessionData){
        console.log(req.sessionData)
    }
    
    Book.find({}).then((books)=>{
        res.render('index', {books: books, sessionData: req.sessionData,  csrfToken: req.csrfToken() })
    }).catch(err=>console.log(err))
})

export default router;