
const cloudinary = require('../utils/cloudinary')
const User = require('../model/userModel')


const profile_get = (req, res) => {
    res.render('profile')
}


const profile_upload_post = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)

        // Make sure a file was selected
        if (!req.file) {
            return res.status(400).send('Please select an image')
        }


        // Upload image buffer directly to Cloudinary
        const result = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'profile_pictures'
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


        // Delete old profile picture after new upload succeeds
        if (user.profilePicture && user.profilePicture.public_id) {

            await cloudinary.uploader.destroy(
                user.profilePicture.public_id,
                {
                    invalidate: true
                }
            )

        }


        // Save new picture information
        user.profilePicture = {
            url: result.secure_url,
            public_id: result.public_id
        }


        await user.save()

        res.redirect('/profile')

    } catch (error) {

        console.log('PROFILE UPLOAD ERROR:', error)

        res.status(500).send('Image upload failed')
    }
}


const profile_delete_post = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)


        if (user.profilePicture && user.profilePicture.public_id) {

            await cloudinary.uploader.destroy(
                user.profilePicture.public_id,
                {
                    invalidate: true
                }
            )

        }


        user.profilePicture = undefined

        await user.save()

        res.redirect('/profile')

    } catch (error) {

        console.log('PROFILE DELETE ERROR:', error)

        res.status(500).send('Image deletion failed')
    }
}


module.exports = {
    profile_get,
    profile_upload_post,
    profile_delete_post
}

