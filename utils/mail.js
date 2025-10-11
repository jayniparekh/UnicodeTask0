import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mail = async (to, subject, msg) => {
  try {
    const info = await transporter.sendMail({
      from: `Unicode Mentee <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: msg,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export default mail;