const Blog = require('../model/blogModel')
const Comment = require('../model/commentModel')
const cloudinary = require('../utils/cloudinary')


const blog_landing = (req, res) => {
    res.render('landing')
}

const blog_homepage = async (req, res) => {
    try {
        const blogs = await Blog.find()
    .populate('owner', 'username profilePicture')
    .sort({ createdAt: -1 })

        const comments = await Comment.aggregate([
            {
                $group: {
                    _id: '$blog',
                    count: { $sum: 1 }
                }
            }
        ])

        const commentCounts = {}

        comments.forEach(comment => {
            commentCounts[comment._id.toString()] = comment.count
        })

        res.render('index', {
            blogs: blogs,
            commentCounts: commentCounts
        })

    } catch (err) {
        console.log(err)
        res.status(500).send('Could not fetch blogs from the database.')
    }
}

const blog_details = async (req, res) => {
    const id = req.params.id

    try {
        const blog = await Blog.findById(id)
            .populate('owner', 'username profilePicture')

        if (!blog) {
            return res.status(404).render('404')
        }

        const comments = await Comment.find({ blog: id })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 })

        const userLiked = req.user && blog.likes
            ? blog.likes.some(id => id.toString() === req.user.id)
            : false

        res.render('details', {
            blog: blog,
            comments: comments,
            userLiked: userLiked
        })

    } catch (err) {
        console.log('BLOG DETAILS ERROR:', err)
        res.status(500).send('Error loading blog details')
    }
}

const blog_create_get = (req, res) => {
    res.render('create')
}

const blog_create_post = async (req, res) => {

    try {

        let image = {
            url: '/images/default-blog.jpg',
            public_id: null
        }

        // Upload image to Cloudinary if one was selected
        if (req.file) {

            const result = await new Promise((resolve, reject) => {

                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'heritage-blog'
                    },

                    (error, result) => {

                        if (error) {
                            reject(error)
                        } else {
                            resolve(result)
                        }

                    }
                )

                uploadStream.end(req.file.buffer)

            })

            image = {
                url: result.secure_url,
                public_id: result.public_id
            }
        }

        const blog = new Blog({
            title: req.body.title,
            snippet: req.body.snippet,
            author: req.body.author,
            body: req.body.body,

            owner: req.user.id,

            image: image
        })

        await blog.save()

        res.redirect('/blogs')

    } catch (err) {

        console.log('BLOG CREATE ERROR:', err)

        res.status(500).send(
            'Could not save the blog post.'
        )
    }
}

const blog_delete = async (req, res) => {
    try {
        const id = req.params.id
        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' })
        }

        if (blog.owner.toString() !== req.user.id) {
            return res.status(403).render('not-allowed')
        }

        await Blog.findByIdAndDelete(id)
        res.json({
            redirect: '/blogs',
            title: blog.title
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Could not delete the blog' })
    }
}

const blog_edit_get = async (req, res) => {
    try {
        const id = req.params.id
        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).render('404')
        }

        if (blog.owner.toString() !== req.user.id) {
            return res.status(403).render('not-allowed')
        }

        res.render('edit', { blog: blog })
    } catch (error) {
        console.log(error)
        res.status(404).render('404')
    }
}

const blog_edit_post = async (req, res) => {
    try {
        const id = req.params.id
        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).render('404')
        }

        if (blog.owner.toString() !== req.user.id) {
            return res.status(403).render('not-allowed')
        }

        await Blog.findByIdAndUpdate(id, req.body)
        res.redirect('/blogs')
    } catch (err) {
        console.log(err)
        res.status(500).render('404')
    }
}

const blog_about = (req, res) => {
    res.render('about')
}

const blog_like = async (req, res) => {
    try {
        const id = req.params.id
        const userId = req.user.id

        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).json({
                error: 'Blog not found'
            })
        }

        // Make sure likes exists
        if (!Array.isArray(blog.likes)) {
            blog.likes = []
        }

        const alreadyLiked = blog.likes.some(
            like => like.toString() === userId
        )

        if (alreadyLiked) {
            blog.likes = blog.likes.filter(
                like => like.toString() !== userId
            )
        } else {
            blog.likes.push(userId)
        }

        await blog.save()

        res.json({
            liked: !alreadyLiked,
            likes: blog.likes.length
        })

    } catch (err) {
        console.log('BLOG LIKE ERROR:', err)

        res.status(500).json({
            error: 'Could not like the blog'
        })
    }
}

const blog_comment = async (req, res) => {
    try {
        const id = req.params.id
        const { text } = req.body

        if (!text || !text.trim()) {
            return res.status(400).json({
                error: 'Comment cannot be empty'
            })
        }

        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).json({
                error: 'Blog not found'
            })
        }

        const comment = new Comment({
            text: text.trim(),
            user: req.user.id,
            blog: id
        })

        await comment.save()

        res.json({
            success: true
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Could not add comment'
        })
    }
}

module.exports = {
    blog_landing,
    blog_homepage,
    blog_details,
    blog_create_get,
    blog_create_post,
    blog_delete,
    blog_edit_get,
    blog_edit_post,
    blog_about,
    blog_like,
    blog_comment
}