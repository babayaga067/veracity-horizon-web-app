import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "./constant";

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("Email credentials are not configured. Email sending will fail. Set EMAIL_USER and EMAIL_PASS in your environment.");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `Veracity Horizon <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
