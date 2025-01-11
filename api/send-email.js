// api/send-email.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { senderName, senderEmail, subject, body } = req.body;

        const emailContent = `
            You have received a new message from the YLP Toastmasters Club form:
            
            Sender Name: ${senderName}

            Sender Email: ${senderEmail}

            Message:
            ${body}
        `;

        // Email options for the club
        const clubMailOptions = {
            from: `YLP Toastmasters Club <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: subject,
            text: emailContent,
            replyTo: senderEmail,
        };

        // Confirmation email to the sender
        const confirmationMailOptions = {
            from: `YLP Toastmasters Club <${process.env.EMAIL_USER}>`,
            to: senderEmail,
            subject: 'Confirmation: Your Email to YLP Toastmasters Club',
            html: `
                <p>Hi ${senderName},</p>
                <p>Thank you for contacting the YLP Toastmasters Club. We have received your message:</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${body}</p>
                <p>We will get back to you shortly.</p>
                <p>Best regards,</p>
                <p>YLP Toastmasters Club</p>
            `,
        };

        // Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        try {
            // Send the email to the club
            const clubEmailResult = await transporter.sendMail(clubMailOptions);
            if (!clubEmailResult.accepted.length) throw new Error('Failed to send email to the club.');
        
            // Send confirmation email to the sender
            const confirmationEmailResult = await transporter.sendMail(confirmationMailOptions);
            if (!confirmationEmailResult.accepted.length) throw new Error('Failed to send confirmation email.');
        
            // Updated success response message
            return res.status(200).json({ message: 'Email is sent successfully, and confirmation email is sent to the user.' });
        } catch (error) {
            console.error('Error sending emails:', error);
            return res.status(500).json({ message: `Error: ${error.message}` });
        }
    } else {
        // If not a POST request
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
