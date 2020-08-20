//jshint esversion:8
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const moment = require('moment');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

////////////////Schema file///////////////
const Artwork = require('./models/artwork');
const seedDb = require('./seeds');
const Comment = require('./models/comment');
const User = require('./models/user');
seedDb();

mongoose.connect('mongodb://localhost:27017/jart', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(methodOverride('_method'));

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

//========================
//ARTWORK ROUTES
//========================

app.get('/', (req, res) => {
	res.render('landing');
});

app.get('/artworks', async (req, res) => {
	try {
		const foundArtworks = await Artwork.find({});
		res.render('artworks/index', { foundArtworks });
	} catch (err) {
		console.log(err);
	}
});

app.get('/artworks/new', (req, res) => {
	res.render('artworks/new');
});

app.post('/artworks', async (req, res) => {
	try {
		const artworks = await Artwork.create(req.body.artwork);
		res.redirect('/artworks');
		console.log(artworks);
	} catch (err) {
		console.log(err);
	}
});

app.get('/artworks/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const foundArtwork = await Artwork.findById(id).populate('comments').exec();
		console.log(foundArtwork);
		res.render('artworks/show', { foundArtwork });
	} catch (err) {
		console.log(err);
	}
});

app.get('/artworks/:id/edit', async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		res.render('artworks/edit', { artwork });
	} catch (err) {
		console.log(err);
	}
});

app.put('/artworks/:id', async (req, res) => {
	const id = req.params.id;
	try {
		await Artwork.findByIdAndUpdate(id, req.body.artwork);
		res.redirect(`/artworks/${id}`);
	} catch (err) {
		console.log(err);
	}
});

app.delete('/artworks/:id', async (req, res) => {
	const id = req.params.id;
	try {
		await Artwork.findByIdAndDelete(id);
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
	}
});

//========================
//COMMENTS ROUTES
//========================

app.post('/artworks/:id/comments', isLoggedIn, async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		const comment = await Comment.create(req.body.comment);
		artwork.comments.push(comment);
		artwork.save();
		res.redirect(`/artworks/${artwork._id}`);
	} catch (err) {
		res.redirect('/artworks');
		console.log(err);
	}
});

// ===================
// AUTH ROUTES
// ===================

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	const newUser = new User({ username: req.body.username });
	const password = req.body.password;
	try {
		await User.register(newUser, password);
		await passport.authenticate('local', (req, res));
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
		res.render('register');
	}
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/artworks',
		failureRedirect: '/login'
	}),
	(req, res) => {}
);

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/artworks');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
