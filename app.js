//jshint esversion:8
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

///////////////////REQUIRE ROUTES////////////////////
const commentRoutes = require('./routes/comments');
const artworkRoutes = require('./routes/artworks');
const indexRoutes = require('./routes/index');

///////////////////////////////
const seedDb = require('./seeds');
const User = require('./models/user');
// seedDb();

mongoose.connect('mongodb://localhost:27017/jart', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(methodOverride('_method'));
app.locals.moment = require('moment');

///////////////PASSPORT CONFIGURATION////////////
app.use(
	require('express-session')({
		secret: 'What a wonderful world',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/////USER MIDDLEWARE///////
app.use((req, res, next) => {
	res.locals.currUser = req.user;
	next();
});

///////////////USING ROUTES////////////////////
app.use(indexRoutes);
app.use(commentRoutes);
app.use(artworkRoutes);

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
