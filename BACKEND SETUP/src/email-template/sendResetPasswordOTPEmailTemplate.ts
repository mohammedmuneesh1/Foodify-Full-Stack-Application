
import nodemailer from "nodemailer";
import { mailTransporter } from "../utils/mailTransport";

export const sendResetPasswordOTPEmailTemplateFn = async (email: string, otp: string) => {
  try {

    const mailOptions = {
      from: `"Foodly App Support" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>

          <p>Hello,</p>

          <p>You requested to reset your password. Use the OTP below:</p>

          <h1 style="
            letter-spacing: 5px;
            color: #2d89ef;
            text-align: center;
            margin: 20px 0;
          ">
            ${otp}
          </h1>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>

          <p>If you did not request this, please ignore this email.</p>

          <br/>

          <p style="font-size: 12px; color: gray;">
            — Your App Team
          </p>
        </div>
      `,
    };

    await mailTransporter.sendMail(mailOptions);

    return {
      success: true,
      message: "OTP sent successfully",
    };

  } catch (error) {
    console.error("MAIL ERROR:", error);
    return {
      success: false,
      message: "Failed to send OTP",
    };
  }
};