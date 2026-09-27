const { Resend } = require('resend')
const otpEmailTemplate = require('./otpEmailTemplate')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async (email, title, body) => {
    try {

        const { data, error } = await resend.emails.send({
            from: 'Alpha_Ink <noreply@supremealpha.ng>',
            to: [email],
            subject: title,
            html: otpEmailTemplate(body)
        })

        if (error) {
            console.log('Resend error:', error)
            throw error
        }

        return data

    } catch (error) {
        console.log('Email sending error:', error)
        throw error
    }
}

module.exports = { sendEmail }