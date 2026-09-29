const User = require('../model/userModel')
const otpGenerator = require('otp-generator')
const { sendEmail } = require('../utils/sendEmail')
const bcrypt = require('bcrypt')

// VERIFY OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        // EMAIL INPUT VALIDATION
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required'})
        }

        // FIND THE USER
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // CHECK IF AN OTP EXISTS
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or has expired'})
        }

        // CHECK IF THE OTP IS NOT EXPIRED
        if (Date.now() > user.otpExpires.getTime()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' })
        }

        // COMPARE ENTERED OTP WITH HASHED OTP
        const isValid = await bcrypt.compare(otp, user.otp)
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }

        // VERIFY USER'S EMAIL
        user.isVerified = true

        // REMOVE THE OTP AFTER SUCCESSFUL VERIFICATION
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            redirect: '/login'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal error in verifying OTP' })
    }
}

// VERIFY EMAIL
const verifyEmail_get = (req, res) => {
    res.render('verify-email')
}

// RESEND OTP
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' })
        }

        // GENERATE A NEW OTP
        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true
        })

        // HASH THE NEW OTP
        const hashedOtp = await bcrypt.hash(otp, 10)

        // SAVE THE NEW OTP AND EXPIRY
        user.otp = hashedOtp
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()

        // SEND THE NEW OTP TO THE USER
        await sendEmail(
            email,
            'Alpha_Ink - New OTP',
            otp
        )

        return res.status(200).json({ success: true, message: 'A new OTP has been sent to your email' })

    } catch (error) {
        console.log('RESEND OTP ERROR:', error)
        return res.status(500).json({ success: false, message: 'Unable to resend OTP' })
    }
}


// FORGOT PASSWORD (POST REQUEST)
const forgotPassword = async (req, res) => {

    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required'})
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' })
        }

        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true
        })

        const hashedOtp = await bcrypt.hash(otp, 10)
        user.resetOtp = hashedOtp
        user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()

        await sendEmail( email, 'Alpha_Ink - New OTP', otp )
        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully',
            redirect: '/reset-password'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Unable to process password reset' })
    }
}

const forgotPassword_get = (req, res) => {
    res.render('forgot-password')
}

// RESET PASSWORD PAGE
const resetPassword_get = (req, res) => {
    res.render('reset-password')
}

// RESET PASSWORD (POST REQUEST)
const resetPassword_post = async (req, res) => {

    try {
        const { email, otp, password } = req.body
        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, message: 'All fields are mandatory'})
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // CHECK IF A RESET OTP EXISTS
        if (!user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({ success: false, message: 'Reset OTP is invalid or has expired'})
        }

        // CHECK IF RESET OTP IS EXPIRED
        if (Date.now() > user.resetOtpExpires.getTime()) {
            return res.status(400).json({ success: false, message: 'Reset OTP has expired' })
        }

        // COMPARE ENTERED OTP WITH HASHED OTP
        const isValid = await bcrypt.compare(otp, user.resetOtp)
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid reset OTP' })
        }

        // CHANGE PASSWORD
        user.password = password

        // REMOVE RESET OTP AFTER SUCCESSFUL RESET
        user.resetOtp = undefined
        user.resetOtpExpires = undefined
        await user.save()
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            redirect: '/login'
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Unable to reset password' })
    }
}

//RESEND RESET OTP
const resendResetOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true
        })

        const hashedOtp = await bcrypt.hash(otp, 10)
        user.resetOtp = hashedOtp
        user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000)
        await user.save()
        await sendEmail(
            email,
            'Alpha_Ink - New OTP',
            otp
        )

        return res.status(200).json({ success: true, message: 'A new password reset OTP has been sent to your email' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Unable to resend password reset OTP' })
    }
}

module.exports = { verifyOtp, verifyEmail_get, resendOtp, forgotPassword, forgotPassword_get, resetPassword_get, resetPassword_post, resendResetOtp }