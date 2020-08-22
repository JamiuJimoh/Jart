//jshint esversion:8
const Artwork = require('./models/artwork');
const Comment = require('./models/comment');

const seeds = [
	{
		title: 'Soul Gaze',
		image: 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947__340.jpg',
		content:
			'Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Quisqu'
	},
	{
		title: 'Painting',
		image:
			'https://images.unsplash.com/photo-1569063386798-345908ef9a62?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
		content:
			'Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Quisqu'
	},
	{
		title: 'Afrique',
		image:
			'https://images.unsplash.com/photo-1569063386798-345908ef9a62?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
		content:
			'Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Quisqu'
	}
];

const removeArtworks = async () => {
	/////Remove all Artworks/////
	try {
		await Artwork.deleteMany({});
		console.log('removed Artworks');
		await Comment.deleteMany({});
		console.log('removed Comments');
		// for (let seed of seeds) {
		// 	const artwork = await Artwork.create(seed);
		// 	console.log('added an artwork');
		// 	const comment = await Comment.create({
		// 		text: 'Such a great art, Love it',
		// 		author: 'Homer'
		// 	});
		// 	console.log('added new comment');
		// 	artwork.comments.push(comment);
		// 	artwork.save();
		// 	console.log('added new comment to artwork');
		// }
	} catch (err) {
		console.log(err);
	}
};

module.exports = removeArtworks;
