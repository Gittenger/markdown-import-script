const mongoose = require('mongoose')
const dotenv = require('dotenv')
const metadataParser = require('markdown-yaml-metadata-parser')
const fs = require('fs')
const path = require('path')

const Markdown = require('./models/markdownSchema')

dotenv.config({ path: './.env' })

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD)
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(
		() => console.log('connected to mongodb successfully'),
		err => console.error(err)
	)

const importData = async () => {
	const files = fs.readdirSync(path.join(__dirname, 'assets'))

	files.forEach(async file => {
		const mdString = fs.readFileSync(
			path.join(__dirname, 'assets', file),
			'utf-8'
		)
		const {
			content,
			metadata: { title, excerpt, date },
		} = metadataParser(mdString)

		const doc = await Markdown.findOne({ title })
		if (!doc) {
			await Markdown.create({
				text: content,
				title,
				excerpt,
				date,
			})
		} else if (doc) {
			await Markdown.findOneAndUpdate(
				{ title },
				{ text: content, title, date, excerpt }
			)
		}
	})
}

const deleteData = async () => {
	try {
		await Markdown.deleteMany()
		console.log('Data successfully deleted')
		process.exit(0)
	} catch (err) {
		console.log(err)
	}
}

if (process.argv[2] === '--import') {
	importData()
} else if (process.argv[2] === '--delete') {
	deleteData()
} else {
	console.log('error: expected argument --import or --delete')
	process.exit(1)
}
