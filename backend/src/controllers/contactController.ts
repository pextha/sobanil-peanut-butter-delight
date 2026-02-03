import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';

export const sendContactEmail = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    // 1. Validate input
    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing EMAIL_USER or EMAIL_PASS in .env');
        res.status(500);
        throw new Error('Server configuration error: Email credentials missing');
    }

    // 2. Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 3. Define Mail Options

    const mailOptions = {
        from: `"Sobanil Web Page" <${process.env.EMAIL_USER}>`,
        to: 'sobanilproducts@gmail.com',
        replyTo: email, // This allows you to click "Reply" and email the customer directly
        subject: `New Message from ${name}: ${subject}`,
        text: `
      Name: ${name}
      Email: ${email}
      Subject: ${subject}

        `,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                    New Contact Form Submission
                </h2>
                <p><strong>Sent by:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                    <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <p style="font-size: 0.8em; color: #777; margin-top: 20px;">
                    This email was sent from the Sobanil Products website contact form.
                </p>
            </div>
        `,
    };

    // 4. Send Email
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500);
        throw new Error('Email could not be sent');
    }
});