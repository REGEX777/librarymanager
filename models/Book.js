import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    cover: String,
    description: String,
    checkedOut: {
        type: Boolean,
        default: false
    },
    checkedOutBy: {
        type: String,
        default: null
    }
})


const Book = new mongoose.model('Book', bookSchema);
export default Book;