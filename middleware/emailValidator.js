import { body, validationResult } from 'express-validator';

export const validateEmail = [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
    body('password')
    .isLength({
        min: 6
    })
    .withMessage('Password must be atleast 6 letters long')
]