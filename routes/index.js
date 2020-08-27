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

router.get('/auth/google', passport.authenticate('google', { scope: [ 'profile' ] }));

router.get('/auth/google/jart', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
	// Successful authentication, redirect home.
	res.redirect('/artworks');
});

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
	if (adminCode === process.env.ADMINCODE) {
		newUser.isAdmin = true;
	}
	try {
		await User.register(newUser, password);
		req.login(newUser, (err) => {
			if (err) {
				req.flash('error', err);
				return next(err);
			}
			req.flash('success', `Welcome to Jart @${newUser.username}`);
			return res.redirect('/artworks');
		});
	} catch (err) {
		req.flash('error', err.message);
		return res.redirect('/register');
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/artworks',
		failureRedirect: '/login',
		failureFlash: true
	}),
	(req, res) => {}
);

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/artworks');
});

///////////USER PROFILE///////
router.get('/users/:id', async (req, res) => {
	try {
		const foundUser = await User.findById(req.params.id);
		const foundArtwork = await Artwork.find().where('author.id').equals(foundUser._id);
		res.render('users/show', { user: foundUser, artworks: foundArtwork });
	} catch (err) {
		req.flash('error', "'Something went wrong'");
		res.redirect('/');
	}
});

router.get('/users/:id/edit', async (req, res) => {
	const id = req.params.id;
	try {
		const foundUser = await User.findById(id);
		req.flash('success', 'Successfully updated');
		res.render('users/edit', { user: foundUser });
	} catch (err) {
		req.flash('error', "'Something went wrong'");
		console.log(err);
	}
});

router.put('/users/:id', async (req, res) => {
	const id = req.params.id;
	try {
		await User.findByIdAndUpdate(id, req.body.user);
		req.flash('success', 'Successfully updated profile');
		res.redirect(`/users/${id}`);
	} catch (err) {
		req.flash('err', `Sorry, ${err}`);
	}
});

module.exports = router;
