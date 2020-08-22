//jshint esversion:8
require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Artwork = require('../models/artwork');

router.get('/', (req, res) => {
	res.render('landing');
});

// ===================
// AUTH ROUTES
// ===================

router.get('/register', (req, res) => {
	res.render('register');
});

router.post('/register', async (req, res) => {
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		email: req.body.email
	});
	const password = req.body.password;
	const adminCode = req.body.adminCode;
	try {
		if (adminCode === process.env.ADMINCODE) {
			newUser.isAdmin = true;
		}
		await User.register(newUser, password);
		await passport.authenticate('local', (req, res));
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
		res.render('register');
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/artworks',
		failureRedirect: '/login'
	}),
	(req, res) => {}
);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/artworks');
});

///////////USER PROFILE///////
router.get('/users/:id', async (req, res) => {
	try {
		const foundUser = await User.findById(req.params.id);
		const foundArtwork = await Artwork.find().where('author.id').equals(foundUser._id);
		res.render('users/show', { user: foundUser, artworks: foundArtwork });
	} catch (err) {
		console.log('Something went wrong');
		res.redirect('/');
	}
});

module.exports = router;
