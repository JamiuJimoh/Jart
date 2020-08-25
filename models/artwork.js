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
		username: String,
		avatar: {
			type: String,
			default:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQEE0kk0aJe_buxVA2a7w2hvmpjmHINzi2pRQ&usqp=CAU'
		}
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
