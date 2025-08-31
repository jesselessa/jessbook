import { createTransport } from "nodemailer";

export const sendEmail = async (options) => {
  // Nodemailer transporter configuration with Gmail 2-step verification required in production
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jessica.elessa@gmail.com",
      pass: process.env.GOOGLE_APP_PASSWORD, // 2-step verification
    },
  });

  const mailOptions = {
    from: "jessica.elessa@gmail.com", // Service and user email can't be hidden anymore using an environment variable
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
