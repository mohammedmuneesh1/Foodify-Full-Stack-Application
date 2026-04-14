
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PASS,
  SMTP_USER,
  SMTP_PORT,
  SENDER_EMAIL,
  
} = process.env;



export const mailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
//   secure: false, // true only for 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});