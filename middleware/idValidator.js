import mongoose from 'mongoose';

export function validateId(req, res, next){
    const id = req.params.id;
    if(!mongoose.isValidObjectId(id)){
        req.flash('error', "Invalid Book ID");
        return res.redirect('/')
    }
    next();
}