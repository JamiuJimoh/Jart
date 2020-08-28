//jshint esversion:8
require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Artwork = require('../models/artwork');
const middleware = require('../middleware');
const Notification = require('../models/notifications');

/////////Image upload config////////////
const multer = require('multer');
const storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
const imageFilter = function(req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'jamiu',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

//////////////End/////////////////////////////

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
			req.flash('success', `Welcome to Jart @${newUser.username}. Please update your profile`);
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

router.put('/users/:id', upload.single('image'), async (req, res) => {
	User.findById(req.params.id, async function(err, user) {
		if (err) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			if (req.file) {
				try {
					if (user.avatarId) {
						await cloudinary.v2.uploader.destroy(user.avatarId);
					}
					const result = await cloudinary.v2.uploader.upload(req.file.path);
					user.avatarId = result.public_id;
					user.avatar = result.secure_url;
				} catch (err) {
					req.flash('error', err.message);
					return res.redirect('back');
				}
			}
			user.firstName = req.body.user.firstName;
			user.lastName = req.body.user.lastName;
			user.username = req.body.user.username;
			user.email = req.body.user.email;
			user.bio = req.body.user.bio;
			user.save();
			req.flash('success', 'Successfully updated profile');
			res.redirect(`/users/${req.params.id}`);
		}
	});
});

///////////////////////////////////////////////

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
	try {
		let user = await User.findById(req.params.id);
		user.followers.push(req.user._id);
		user.save();
		req.flash('success', `Successfully followed ${user.username} !`);
		res.redirect('/users/' + req.params.id);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('back');
	}
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
	try {
		const user = await User.findById(req.user._id)
			.populate({
				path: 'notifications',
				avatar: 'avatarId',
				options: { sort: { _id: -1 } }
			})
			.exec();

		const notifUser = await User.findOne({ username: user.notifications[0].username });
		const allNotifications = user.notifications;
		const avatar = notifUser.avatar;
		res.render('notifications/index', { allNotifications, avatar });
	} catch (err) {
		req.flash('error', 'Oops, You do not have any past notifications');
		res.redirect('back');
	}
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
	try {
		let notification = await Notification.findById(req.params.id);
		notification.isRead = true;
		notification.save();
		res.redirect(`/artworks/${notification.artworkId}`);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('back');
	}
});

router.delete('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
	try {
		await Notification.findByIdAndDelete(req.params.id);
		res.redirect('back');
	} catch (err) {
		console.log(err);
		req.flash('error', err.message);
	}
});

router.get('/about', (req, res) => {
	res.render('about');
});

module.exports = router;
