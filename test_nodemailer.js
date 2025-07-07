const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: "Test Email from Mitho Bites backend",
  text: "This is a test email from Mitho Bites backend. If you receive this, your nodemailer config is correct."
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('Email error:', err);
  } else {
    console.log('Email sent:', info.response);
  }
}); 