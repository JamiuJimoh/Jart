//jshint esversion:8
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');

const middlewareObj = {};
middlewareObj.checkArtworkOwnership = async function(req, res, next) {
	if (req.isAuthenticated()) {
		const id = req.params.id;
		try {
			const artwork = await Artwork.findById(id);
			if (artwork.author.id.equals(req.user._id) || req.user.isAdmin) {
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
};

middlewareObj.checkCommentOwnership = async function(req, res, next) {
	if (req.isAuthenticated()) {
		const id = req.params.comment_id;
		try {
			const foundComment = await Comment.findById(id);
			if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
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
};

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

module.exports = middlewareObj;
