const nodemailer = require('nodemailer');

// Configure your email transporter (example for Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send welcome email
exports.sendWelcomeEmail = (email, name, tempPassword) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Our Management System',
        text: `Hi ${name},\n\nYour account has been created.\n\nTemporary Password: ${tempPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nThe Management Team`,
        html: `<p>Hi ${name},</p>
               <p>Your account has been created.</p>
               <p><strong>Temporary Password:</strong> ${tempPassword}</p>
               <p>Please change your password after logging in.</p>
               <p>Best regards,<br>The Management Team</p>`
    };

    return transporter.sendMail(mailOptions);
};