//jshint esversion:8
require('dotenv').config();
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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
	bio: String,
	googleId: String,
	isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

///////////////GOOGLE AUTH/////////////
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/auth/google/jart',
			userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
		},
		function(accessToken, refreshToken, profile, cb) {
			User.findOrCreate({ googleId: profile.id }, function(err, user) {
				return cb(err, user);
			});
		}
	)
);

module.exports = User;
