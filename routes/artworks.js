//jshint esversion:8
const express = require('express');
const router = express.Router({ mergeParams: true });
const Artwork = require('../models/artwork');

router.get('/artworks', async (req, res) => {
	try {
		const foundArtworks = await Artwork.find({});
		res.render('artworks/index', { foundArtworks });
	} catch (err) {
		console.log(err);
	}
});

router.get('/artworks/new', isLoggedIn, (req, res) => {
	res.render('artworks/new');
});

router.post('/artworks', isLoggedIn, async (req, res) => {
	const title = req.body.title;
	const image = req.body.image;
	const content = req.body.content;
	const author = {
		id: req.user._id,
		username: req.user.username
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

router.get('/artworks/:id/edit', checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		res.render('artworks/edit', { artwork });
	} catch (err) {
		console.log(err);
		res.redirect('/artworks');
	}
});

router.put('/artworks/:id', checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		await Artwork.findByIdAndUpdate(id, req.body.artwork);
		res.redirect(`/artworks/${id}`);
	} catch (err) {
		console.log(err);
	}
});

router.delete('/artworks/:id', checkArtworkOwnership, async (req, res) => {
	const id = req.params.id;
	try {
		const deletedArtwork = await Artwork.findByIdAndDelete(id);
		await Comment.deleteMany({ _id: { $in: deletedArtwork.comments } });
		res.redirect('/artworks');
	} catch (err) {
		console.log(err);
	}
});

////////middleware

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

async function checkArtworkOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		const id = req.params.id;
		try {
			const artwork = await Artwork.findById(id);
			if (artwork.author.id.equals(req.user._id)) {
				next();
			} else {
				res.redirect('back');
			}
		} catch (err) {
			console.log(err);
			res.redirect('back');
		}
	} else {
		res.redirect('back');
	}
}

module.exports = router;
