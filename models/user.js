//jshint esversion:8
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: {
		type: String,
		default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQEE0kk0aJe_buxVA2a7w2hvmpjmHINzi2pRQ&usqp=CAU'
	},
	firstName: String,
	lastName: String,
	email: String,
	isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
