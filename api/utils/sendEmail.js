import { createTransport } from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = createTransport({
    host: process.env.SERVICE_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SERVICE_USER,
      pass: process.env.SERVICE_PSWD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.SERVICE_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
