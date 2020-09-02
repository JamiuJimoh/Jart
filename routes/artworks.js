//jshint esversion:8
require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');
const User = require('../models/user');
const Notification = require('../models/notifications');
const middleware = require('../middleware');

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

router.get('/artworks', async (req, res) => {
	try {
		const foundArtworks = await Artwork.find({});
		res.render('artworks/index', { foundArtworks });
	} catch (err) {
		console.log(err);
	}
});

router.get('/artworks/new', middleware.isLoggedIn, (req, res) => {
	res.render('artworks/new');
});

router.post('/artworks', middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, async function(err, result) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		// add cloudinary url for the image to the campground object under image property
		req.body.artwork.image = result.secure_url;
		// add image's public_id to campground object
		req.body.artwork.imageId = result.public_id;
		// add author to campground
		req.body.artwork.author = {
			id: req.user._id,
			username: req.user.username,
			avatar: req.user.avatar
		};

		try {
			let artwork = await Artwork.create(req.body.artwork);
			let user = await User.findById(req.user._id).populate('followers').exec();
			let newNotification = {
				username: req.user.username,
				artworkId: artwork.id
			};
			for (const follower of user.followers) {
				let notification = await Notification.create(newNotification);
				follower.notifications.push(notification);
				await follower.save();
			}

			//redirect back to campgrounds page
			res.redirect(`/artworks/${artwork.id}`);
		} catch (err) {
			req.flash('error', err.message);
			res.redirect('back');
		}
	});
});

router.get('/artworks/:id', (req, res) => {
	const id = req.params.id;
	Artwork.findById(id).populate('comments likes').exec(function(err, foundArtwork) {
		if (err || !foundArtwork) {
			req.flash('error', 'Artwork not found');
			res.redirect('back');
		} else {
			res.render('artworks/show', { foundArtwork });
		}
	});
});

router.get('/artworks/:id/edit', middleware.checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		res.render('artworks/edit', { artwork });
	} catch (err) {
		console.log(err);
		res.redirect('/artworks');
	}
});

router.put('/artworks/:id', middleware.checkArtworkOwnership, upload.single('image'), function(req, res) {
	Artwork.findById(req.params.id, async function(err, artwork) {
		if (err) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			if (req.file) {
				try {
					await cloudinary.v2.uploader.destroy(artwork.imageId);
					const result = await cloudinary.v2.uploader.upload(req.file.path);
					artwork.imageId = result.public_id;
					artwork.image = result.secure_url;
				} catch (err) {
					req.flash('error', err.message);
					return res.redirect('back');
				}
			}
			artwork.title = req.body.title;
			artwork.content = req.body.content;
			await artwork.save();
			req.flash('success', 'Successfully updated');
			res.redirect(`/artworks/${artwork._id}`);
		}
	});
});

router.delete('/artworks/:id', middleware.checkArtworkOwnership, (req, res) => {
	Artwork.findById(req.params.id, async function(err, artwork) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		try {
			await cloudinary.v2.uploader.destroy(artwork.imageId);
			artwork.remove();
			req.flash('success', 'Artwork successfully deleted!');
			res.redirect('/artworks');
		} catch (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
	});
});

/////Likes/////////
router.post('/artworks/:id/like', middleware.isLoggedIn, async (req, res) => {
	try {
		const foundArtwork = await Artwork.findById(req.params.id);
		const foundUserLike = await foundArtwork.likes.some((like) => {
			return like.equals(req.user._id);
		});
		if (foundUserLike) {
			foundArtwork.likes.pull(req.user._id);
		} else {
			foundArtwork.likes.push(req.user);
		}
		await foundArtwork.save();
		res.redirect(`/artworks/${foundArtwork._id}`);
	} catch (err) {
		console.log(err);
		res.redirect('/artworks');
	}
});

module.exports = router;
