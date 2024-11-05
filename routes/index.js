import express from 'express';

const router = express.Router()

import Book from '../models/Book.js';

router.get('/', (req, res)=>{
    Book.find({}).then((books)=>{
        res.render('index', {books: books})
    }).catch(err=>console.log(err))
})

export default router;