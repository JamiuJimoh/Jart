//jshint esversion:8
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
	text: String,
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
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
