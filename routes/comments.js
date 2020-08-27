//jshint esversion:8
const express = require('express');
const router = express.Router();
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');
const middleware = require('../middleware');

router.post('/artworks/:id/comments', middleware.isLoggedIn, async (req, res) => {
	const id = req.params.id;
	try {
		const artwork = await Artwork.findById(id);
		const comment = await Comment.create(req.body.comment);
		// add username and id to comment
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.author.avatar = req.user.avatar;
		console.log(req.user);
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

router.get('/artworks/:id/comments/:comment_id/edit', middleware.checkCommentOwnership, async (req, res) => {
	try {
		const foundComment = await Comment.findById(req.params.comment_id);
		res.render('comments/edit', { foundArtwork_id: req.params.id, comment: foundComment });
	} catch (err) {
		res.redirect('back');
	}
});

router.put('/artworks/:id/comments/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
	try {
		await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
		res.redirect(`/artworks/${req.params.id}`);
	} catch (err) {
		res.redirect('back');
	}
});

router.delete('/artworks/:id/comments/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
	try {
		await Comment.findByIdAndDelete(req.params.comment_id);
		req.flash('success', 'Comment deleted');
		res.redirect(`/artworks/${req.params.id}`);
	} catch (err) {
		res.redirect('back');
	}
});

module.exports = router;
