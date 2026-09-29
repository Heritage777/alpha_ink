const mongoose = require('mongoose')

const Schema = mongoose.Schema

const blogSchema = new Schema({

    title: { type: String, required: true },
    snippet: { type: String, required: true },
    author: { type: String, required: true },
    body: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: {type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], default: [] },
    image: { url: { type: String,
        default: 'https://i.pinimg.com/1200x/6d/f3/c0/6df3c08ce44558439ac6787b68553eb3.jpg' },
        public_id: { type: String, default: null }
    }

}, { timestamps: true })

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog