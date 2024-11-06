import 'dotenv/config';
import express from 'express';
import colors from 'colors';
import ejs from 'ejs';
import fs from 'fs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import flash from 'express-flash';
import session from 'express-session';
import bcrypt from 'bcrypt';
import csrf from 'csurf';

// model import
import User from './models/User.js';
// test
// Mongoose connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("[+] Database connection successful".cyan);
})
.catch(err => console.log(err));

const app = express();

// setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// cookie parser
app.use(cookieParser());

// express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// express flash
app.use(flash());
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Invalid CSRF token');
    } else {
        next(err);
    }
});
// passport.js configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
    done(null, user.id); // Storing only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Fetch user from the database
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                // if no user return some sort of error pls
                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect email or password',
                    });
                }

                // if the user exists check the password if that correct or not
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, {
                        message: 'Incorrect email or password',
                    });
                }

                // if both user and password are valid send back the user object (I see what you did there hahah)
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// middleware for flash messages
app.use((req, res, next) => {
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


app.use((req, res, next) => {
    res.locals.user = req.user || null;  
    res.locals.sessionData = req.sessionData || null; 
    next();
});

// p]ort
const port = 3000;

// Config init
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
app.locals.config = config;

// Routes init
import indexRoute from './routes/index.js';
import signupRoute from './routes/signup.js';
import loginRoute from './routes/login.js';
import logoutRoute from './routes/logout.js';
import adminRoute from './routes/admin.js';
import sessionRoute from './routes/session.js';
import bookRoute from './routes/book.js'

// Routes
app.use('/', indexRoute);
app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/logout', logoutRoute);
app.use('/admin', adminRoute);
app.use('/sessions', sessionRoute)
app.use('/book', bookRoute)

// server
app.listen(port, () => {
    console.log(`[+] Server Started On Port: ${port}.`.cyan);
});
