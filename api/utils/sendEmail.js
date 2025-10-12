import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  try {
    // Nodemailer transporter configuration with Gmail required in production
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jessica.elessa@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD, // 2-step verification
      },
    });

    const mailOptions = {
      from: "jessica.elessa@gmail.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error; // Re-throw error to handle it in calling function
  }
};
