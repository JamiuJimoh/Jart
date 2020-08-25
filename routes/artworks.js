//jshint esversion:8
const express = require('express');
const router = express.Router({ mergeParams: true });
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const middlewareObj = require('../middleware');

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

router.post('/artworks', middleware.isLoggedIn, async (req, res) => {
	console.log(req.user);
	const title = req.body.title;
	const image = req.body.image;
	const content = req.body.content;
	const author = {
		id: req.user._id,
		username: req.user.username,
		avatar: req.user.avatar
	};
	const newArtwork = {
		title,
		image,
		content,
		author
	};
	try {
		const artworks = await Artwork.create(newArtwork);
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
	}
});

router.get('/artworks/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const foundArtwork = await Artwork.findById(id).populate('comments').exec();
		res.render('artworks/show', { foundArtwork });
	} catch (err) {
		console.log(err);
	}
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

router.put('/artworks/:id', middleware.checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		await Artwork.findByIdAndUpdate(id, req.body.artwork);
		res.redirect(`/artworks/${id}`);
	} catch (err) {
		console.log(err);
	}
});

router.delete('/artworks/:id', middleware.checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		const deletedArtwork = await Artwork.findByIdAndDelete(id);
		await Comment.deleteMany({ _id: { $in: deletedArtwork.comments } });
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
	}
});

/////Likes/////////
router.post('/artworks/:id/like', middleware.isLoggedIn, async (req, res) => {
	try {
		const foundArtwork = await Artwork.findById(req.params.id).populate('comments likes').exec();
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
