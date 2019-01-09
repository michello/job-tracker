const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();

require('./config/db.js');
require('./config/passport.js')(passport);

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use(session({
	secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(process.env.PORT || 3000);