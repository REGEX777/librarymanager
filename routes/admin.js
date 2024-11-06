import express from 'express';

const router = express.Router();

// middleware import
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { isAdmin } from '../middleware/isAdmin.js';

// model
import Book from '../models/Book.js'
import { body } from 'express-validator';
router.get('/', isLoggedIn, isAdmin, (req, res)=>{
    res.render('admin')
})
 
router.post('/book/new', async (req, res) => {
    try {
        const { title, author, coverurl, description } = req.body;
        const errorMessages = [];

        // simple validation
        if (!title || title.length > 100) {
            errorMessages.push('Invalid title. Must be less than 100 characters.');
        }

        if (!author || author.length > 50) {
            errorMessages.push('Invalid author name. Must be less than 50 characters.');
        }

        // using regex to check if the url is a legit one
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        if (!coverurl || !urlRegex.test(coverurl)) {
            errorMessages.push('Invalid URL for the cover.');
        }

        if (!description || description.length > 500) {
            errorMessages.push('Invalid description. Must be less than 500 characters.');
        }

        // If there are any validation errors, flash and redirect
        if (errorMessages.length > 0) {
            req.flash('error', errorMessages);
            return res.redirect('/admin');
        }

        // escaping html stuff
        const escapeHtml = (str) => {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const sanitizedTitle = escapeHtml(title);
        const sanitizedAuthor = escapeHtml(author);
        const sanitizedDescription = escapeHtml(description);

        const newBook = new Book({
            title: sanitizedTitle,
            author: sanitizedAuthor,
            cover: coverurl,
            description: sanitizedDescription
        });

        await newBook.save();
        req.flash('success', 'Book added successfully!');
        res.redirect('/');
    } catch (err) {
        console.error('Error saving book:', err);
        req.flash('error', 'An error occurred while saving the book.');
        res.redirect('/admin');
    }
});

export default router;