const mongoose = require('mongoose')

const markdownSchema = new mongoose.Schema({
	text: {
		type: String,
		required: [true, 'Text is a required field'],
	},
	title: {
		type: String,
		required: [true, 'Title is required in metadata'],
	},
	excerpt: {
		type: String,
		required: [true, 'Must have an excerpt in metadata'],
	},
	date: {
		type: Date,
		required: [true, 'Date is required'],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
})

const Markdown = mongoose.model('Markdown', markdownSchema)

module.exports = Markdown
