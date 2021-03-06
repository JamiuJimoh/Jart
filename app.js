//jshint esversion:8
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const app = express();

///////////////////REQUIRE ROUTES////////////////////
const commentRoutes = require('./routes/comments');
const artworkRoutes = require('./routes/artworks');
const indexRoutes = require('./routes/index');

///////////////////////////////
const seedDb = require('./seeds');
const User = require('./models/user');
// seedDb();
const password = process.env.JARTDB;
mongoose
	.connect(`mongodb+srv://Jamiu:${password}@cluster0.fudqj.mongodb.net/Jart`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.catch((error) => console.log(error));

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
app.use(flash());

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

/////USER MIDDLEWARE///////
app.use(async function(req, res, next) {
	res.locals.currUser = req.user;
	if (req.user) {
		try {
			let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
			res.locals.notifications = user.notifications.reverse();
		} catch (err) {
			console.log(err.message);
		}
	}
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});
///////////////USING ROUTES////////////////////
app.use(indexRoutes);
app.use(commentRoutes);
app.use(artworkRoutes);

const port = process.env.PORT || 3000;
const ip = process.env.IP || '0.0.0.0';

app.listen(port, ip, function() {
	console.log('Server started on port 3000');
});
