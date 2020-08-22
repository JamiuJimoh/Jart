//jshint esversion:8
const mongoose = require('mongoose');
const artworkSchema = new mongoose.Schema({
	title: String,
	image: String,
	content: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	createdAt: { type: Date, default: Date.now },
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	],
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	]
});

const Artwork = mongoose.model('Artwork', artworkSchema);
module.exports = Artwork;
