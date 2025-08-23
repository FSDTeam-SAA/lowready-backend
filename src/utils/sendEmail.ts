import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.APP_USER,
      pass: process.env.APP_PASS,
    },
  })
  await transporter.sendMail({
    from: "nm.bdcalling@gmail.com", // sender address
    to,
    subject: subject
      ? subject
      : "Password change Link : change it by 10 minutes",
    html,
  });
};
