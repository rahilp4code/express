const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1] Create a Transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    // Activaate in gmail "less secure app" option
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // 2] define the email options
  const mailOptions = {
    from: 'rahil pathan <rahil23@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3] actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
