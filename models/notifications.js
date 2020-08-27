//jshint esversion:8
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
	username: String,
	artworkId: String,
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);
