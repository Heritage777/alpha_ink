const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../model/userModel')
const otpGenerator = require('otp-generator')
const OTP = require('../model/otpModel')
const { sendEmail } = require('../utils/sendEmail')
const bcrypt = require('bcrypt')


//ERROR LOGIC
const handleErrors = (err)=>{
    console.log(err.message, err.code)
    let errors = { email: '', password: '' };

    if (err.message === 'Incorrect email') {
        errors.email = 'That email is not registered';
        return errors; // <-- Add return here!
    }

    if (err.message === 'Incorrect password') {
        errors.password = 'That password is incorrect';
        return errors; // <-- Add return here!
    }

    if (err.code === 11000) {
        errors.email = 'That email is already registered';
        return errors;
    }

    if (err.message && err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    
    return errors;
}

//TOKEN CREATION LOGIC
const maxAge = 1 * 24 * 60 * 60
const createToken = (id)=>{
    return jwt.sign({id}, 'net ninja secret', {
        expiresIn: maxAge
    })
}

//REQUESTS
const signup_get = (req, res)=>{
    res.render('signup')
}
const login_get = (req, res)=>{
    res.render('login')
}

const signup_post = async (req, res) => {
    const { username, email, password, passwordConfirm } = req.body

    try {

        // CONFIRM PASSWORD MATCH
        if (password !== passwordConfirm) {
            return res.status(400).json({
                errors: {
                    passwordConfirm: 'Passwords do not match'
                }
            })
        }

        // GENERATE A 6-DIGIT OTP
        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true
        })

        // HASH THE OTP
        const hashedOtp = await bcrypt.hash(otp, 10)

        // CREATE THE USER
        const user = await User.create({
            username,
            email,
            password,
            otp: hashedOtp,
            otpExpires: new Date(Date.now() + 5 * 60 * 1000)
        })

        // SEND THE OTP TO THE USER'S EMAIL
        await sendEmail(
            email,
            'Alpha_Ink - OTP Verification',
            otp
        )

        // SEND SUCCESS RESPONSE
        res.status(201).json({
            success: true,
            message: 'Account created. Please verify your email.',
            redirect: '/verify-email'
        })

    } catch (error) {
        console.log(error)
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
}


const login_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.login(email, password)

        //CHECK EMAIL VERIFICATION BEFORE CREATING JWT
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in' })
        }
        const token = createToken(user._id)
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        })
        res.status(200).json({
            user: user._id
        })

    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
}

const logout_get = (req, res) =>{
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/')
}

const changePassword_get = (req, res) => {
    res.render('change-password')
}

const changePassword_post = async (req, res) => {
    try {
        const { currentPassword, newPassword, passwordConfirm } = req.body
        
        if (!currentPassword || !newPassword || !passwordConfirm) {
            return res.status(400).json({ success: false, message: 'All password fields are required' })
        }

        if (newPassword !== passwordConfirm) {
            return res.status(400).json({ success: false, message: 'New passwords do not match'})
        }

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const isMatch = await bcrypt.compare( currentPassword, user.password )

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect'})
        }

        user.password = newPassword
        await user.save()
        
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            redirect: '/blogs'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Unable to change password' })
    }
}


module.exports = {signup_get, login_get, signup_post, login_post, logout_get, changePassword_get, changePassword_post}