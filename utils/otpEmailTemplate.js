const otpEmailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alpha_Ink - Email Verification</title>
    </head>

    <body style="margin:0; padding:0; background-color:#080b12; font-family:Arial, Helvetica, sans-serif; color:#ffffff;">

        <div style="width:100%; padding:40px 15px; background-color:#080b12; box-sizing:border-box;">

            <div style="max-width:520px; margin:0 auto; background-color:#101722; border:1px solid #263344; border-radius:16px; overflow:hidden;">

                <!-- HEADER -->
                <div style="background:#00ffff; padding:25px 20px; text-align:center;">

                    <h1 style="margin:0; font-size:24px; font-weight:800; color:#000000; letter-spacing:1px;">
                        ALPHA_INK
                    </h1>

                    <p style="margin:8px 0 0; font-size:12px; color:#003333;">
                        Stories. Ideas. Perspectives.
                    </p>

                </div>

                <!-- CONTENT -->
                <div style="padding:35px 30px; text-align:center;">

                    <h2 style="color:#ffffff; font-size:23px; margin:0 0 15px;">
                        Verify Your Email
                    </h2>

                    <p style="color:#aab5c5; font-size:15px; line-height:1.7; margin:0 0 20px;">
                        Welcome to Alpha_Ink! We're glad you're joining
                        our community of writers and readers.
                    </p>

                    <p style="color:#aab5c5; font-size:15px; line-height:1.7; margin:0 0 20px;">
                        To complete your registration, enter the verification
                        code below:
                    </p>

                    <!-- OTP BOX -->
                    <div style="background-color:#080e17; border:1px solid #00b3b3; border-radius:12px; padding:22px 15px; margin:25px 0;">

                        <div style="color:#7f91a8; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                            Your verification code
                        </div>

                        <div style="color:#00ffff; font-size:36px; font-weight:800; letter-spacing:10px; margin:0;">
                            ${otp}
                        </div>

                    </div>

                    <!-- EXPIRY NOTICE -->
                    <div style="background-color:#1b2431; border-radius:8px; padding:14px; color:#c2ccda; font-size:13px; line-height:1.6; margin-top:20px;">

                        This code expires in <strong>5 minutes</strong>.
                        Please complete your verification before it expires.

                    </div>

                    <!-- SECURITY NOTICE -->
                    <div style="color:#7f91a8; font-size:12px; line-height:1.7; margin-top:25px;">

                        If you didn't request this code, you can safely
                        ignore this email. Never share your verification
                        code with anyone.

                    </div>

                </div>

                <!-- FOOTER -->
                <div style="border-top:1px solid #263344; padding:22px 20px; text-align:center;">

                    <p style="margin:5px 0; color:#7f91a8; font-size:12px; line-height:1.6;">
                        Sent with care by
                        <span style="color:#00ffff; font-weight:bold;">
                            Alpha_Ink
                        </span>
                    </p>

                    <p style="margin:5px 0; color:#7f91a8; font-size:12px; line-height:1.6;">
                        &copy; ${new Date().getFullYear()} Alpha_Ink.
                        All rights reserved.
                    </p>

                </div>

            </div>

        </div>

    </body>
    </html>
    `
}

module.exports = otpEmailTemplate