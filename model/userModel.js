const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {type: String, required: [true, 'please enter an email'], unique: true, lowercase: true, validate: [isEmail, 'Please enter a valid email']},
    password: {type: String, required: [true, 'please enter a password'], minLength: [6, 'minimum password length is 6 characters']},
    isVerified: {type: Boolean, default: false},
    otp: {type: String},
    otpExpires: {type: Date},
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
    username: { type: String, trim: true, required: [true, 'please enter a username'], unique: true },
    profilePicture: { url: String, public_id: String }, // url means the location of the image in cloudinary and public_id is the unique identifier for the image in cloudinary
}, {timestamps: true})

userSchema.pre('save', async function (){
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password, salt)
    }
    console.log('password is hashed before user is created', this)
})

//STATIC LOGIN METHOD
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email})
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) { return user }
        throw Error('Incorrect password')
    }
    throw Error('Incorrect email')
}

// FUNCTION AFTER USER IS CREATED
userSchema.post('save', function (doc, next){
    console.log('New user was created and saved.', doc)
    next()
})

const User = mongoose.model('User', userSchema) 
module.exports = User   