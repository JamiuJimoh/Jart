//jshint esversion:8
require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

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
	const newUser = new User({ username: req.body.username });
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

// //////////middleware

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
