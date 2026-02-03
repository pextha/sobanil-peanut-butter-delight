import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';

export const sendContactEmail = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing EMAIL_USER or EMAIL_PASS in .env');
        res.status(500);
        throw new Error('Server configuration error: Email credentials missing');
    }

    // Create transporter
    // Note: For Gmail, you need to use an App Password if 2FA is on.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // e.g. sobanilproducts@gmail.com
            pass: process.env.EMAIL_PASS, // e.g. your app password
        },
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // Send from your auth email to avoid spoofing blocks
        to: 'sobanilproducts@gmail.com',
        replyTo: email, // Reply to the user
        subject: `New Contact Message: ${subject}`,
        text: `
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
      ${message}
    `,
        html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500);
        throw new Error('Email could not be sent');
    }
});
