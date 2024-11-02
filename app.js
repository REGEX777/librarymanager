import express from 'express';
import colors from 'colors';
import ejs from 'ejs';
import fs from 'fs';

// declarations
const app = express()

// setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
// Port
const port = 3000


// config init

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
app.locals.config = config;

// Routes Init
import indexRoute from './routes/index.js'

// routes
app.use('/', indexRoute);

// Server Stuff
app.listen(port, ()=>{
    console.log(`[+] Server Started On Port: ${port}.`.cyan)
})