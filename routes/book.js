import express from 'express';


const router = express.Router();
import Book from '../models/Book.js';
import User from '../models/User.js';

// middlware import
import { validateId } from '../middleware/idValidator.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { isLoggedIn } from '../middleware/isLoggedIn.js';

router.get('/:id', validateId, async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        
        let checkedOutByUser = null;
        if (book.checkedOutBy) {
            checkedOutByUser = await User.findById(book.checkedOutBy).select('email');
        }

        res.render('book', { book: book, checkedOutByUser: checkedOutByUser });
    } catch (err) {
        console.error(err);
    }
});

router.post('/:id/checkout', isLoggedIn, async(req, res)=>{
    try {
        const bookID = req.params.id;
        const userID = req.body.userid;

        // find the book and update the checkedout and checkedoutfield
        const updatedBook = await Book.findOneAndUpdate(
            { _id: bookID, checkedOut: false },
            {
                checkedOut: true,
                checkedOutBy: userID, 
            },
            { new: true }
        );

        if (!updatedBook) {
            req.flash('error', 'Book not found or already checked out.' );
            return res.redirect('/')
        }
        req.flash('success', 'Book checked out succesfully.' );
        return res.redirect(`/book/${bookID}`)
    } catch (err) {
        console.error(err);
        req.flash('error', 'Internal server error' );
        return res.redirect(`/book/${req.params.id}`)
    }
})      

router.post('/:id/return', isLoggedIn, async (req, res) => {
    try {
        const bookID = req.params.id;
        const userID = req.body.userid;

        const book = await Book.findOne({ _id: bookID });

        if (!book || book.checkedOutBy !== userID) {
            req.flash('error', 'You are not authorized to return this book or the book was not found.');
            return res.redirect('/');
        }

        const updatedBook = await Book.findOneAndUpdate(
            { _id: bookID },
            {
                checkedOut: false,
                checkedOutBy: null,
            },
            { new: true }
        );

        if (!updatedBook) {
            req.flash('error', 'Failed to return the book.');
            return res.redirect('/');
        }

        req.flash('success', 'Book returned successfully.');
        return res.redirect(`/book/${bookID}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Internal server error.');
        return res.redirect(`/book/${req.params.id}`);
    }
});

router.post('/:id/delete', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const bookID = req.params.id;
        
        const deletedBook = await Book.findByIdAndDelete(bookID);

        if (!deletedBook) {
            req.flash('error', 'Book not found.');
            return res.redirect('/');
        }

        req.flash('success', 'Book deleted successfully.');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Internal server error.');
        res.redirect('/');
    }
});

export default router;