//jshint esversion:8
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
	username: String,
	artworkId: String,
	avatar: String,
	createdAt: { type: Date, default: Date.now },
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
