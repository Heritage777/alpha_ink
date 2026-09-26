const express = require('express')
const router = express.Router()
const blogController = require('../controller/blogController')
const { requireAuth } = require('../middleware/authMiddleware')
const profileController = require('../controller/profileController')
const upload = require('../middleware/upload')

router.get('/landing', blogController.blog_landing)
router.get('/', requireAuth, blogController.blog_homepage)
router.get('/blogs', requireAuth, blogController.blog_homepage)
router.get('/about', requireAuth, blogController.blog_about)
router.get('/profile', requireAuth, profileController.profile_get)
router.post('/profile/delete', requireAuth, profileController.profile_delete_post)
router.post('/profile/upload', requireAuth, upload.single('image'), profileController.profile_upload_post)

router.get('/create', requireAuth, blogController.blog_create_get)
router.post('/blogs', requireAuth, upload.single('image'), blogController.blog_create_post)

router.get('/blogs/edit/:id', requireAuth, blogController.blog_edit_get)
router.post('/blogs/edit/:id', requireAuth, blogController.blog_edit_post)

router.get('/blogs/:id', requireAuth, blogController.blog_details)
router.delete('/blogs/:id', requireAuth, blogController.blog_delete)

router.post('/blogs/:id/like', requireAuth, blogController.blog_like)
router.post('/blogs/:id/comments', requireAuth, blogController.blog_comment)

module.exports = router