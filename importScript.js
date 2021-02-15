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

const syncData = () => {
	const files = fs.readdirSync(path.join(__dirname, 'assets'))

	const response = files.map(async file => {
		const mdString = fs.readFileSync(
			path.join(__dirname, 'assets', file),
			'utf-8'
		)
		const { content, metadata } = metadataParser(mdString)

		const doc = await Markdown.findOne({ title: metadata.title })

		if (!doc) {
			const newDoc = await Markdown.create({
				content,
				...metadata,
			})
			return newDoc
		} else if (doc) {
			const updated = await doc.updateOne({ content, ...metadata }).exec()
			return updated
		}
	})

	Promise.all(response).then(() => {
		console.log('all done')
		process.exit(0)
	})
}

const deleteData = async () => {
	try {
		await Markdown.deleteMany()
		console.log('Data successfully deleted')
		process.exit(0)
	} catch (err) {
		console.log(err)
		process.exit(1)
	}
}

if (process.argv[2] === '--sync') {
	syncData()
} else if (process.argv[2] === '--delete') {
	deleteData()
} else {
	console.log('error: expected argument --import or --delete')
	process.exit(1)
}
