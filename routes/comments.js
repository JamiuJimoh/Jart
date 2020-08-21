//jshint esversion:8
const express = require('express');
const router = express.Router();
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');

router.post('/artworks/:id/comments', isLoggedIn, async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		const comment = await Comment.create(req.body.comment);
		// add username and id to comment
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		// save comment
		comment.save();
		artwork.comments.push(comment);
		artwork.save();
		console.log(comment);
		res.redirect(`/artworks/${artwork._id}`);
	} catch (err) {
		res.redirect('/artworks');
		console.log(err);
	}
});

// //////middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
