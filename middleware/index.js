//jshint esversion:8
const Artwork = require('../models/artwork');
const Comment = require('../models/comment');

const middlewareObj = {};
middlewareObj.checkArtworkOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		const id = req.params.id;
		Artwork.findById(id, (err, artwork) => {
			if (err || !artwork) {
				req.flash('error', 'Artwork not found');
				res.redirect('back');
			} else {
				if (artwork.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error', "You don't have permission to do that!");
					res.redirect('back');
				}
			}
		});
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
				req.flash('error', "You don't have permission to do that!");
				res.redirect('back');
			}
		} catch (err) {
			req.flash('error', 'Comment not found');
			res.redirect('back');
		}
	} else {
		req.flash('error', 'Oops, you need to be logged in to do that!');
		res.redirect('back');
	}
};

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'Oops, you need to be logged in to do that!');
	res.redirect('/login');
};

module.exports = middlewareObj;
