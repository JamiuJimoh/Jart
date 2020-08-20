//jshint esversion:8
const mongoose = require('mongoose');
const comment = require('./comment');
const artworkSchema = new mongoose.Schema({
	title: String,
	image: String,
	content: String,
	createdAt: { type: Date, default: Date.now() },
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
});

const Artwork = mongoose.model('Artwork', artworkSchema);
module.exports = Artwork;