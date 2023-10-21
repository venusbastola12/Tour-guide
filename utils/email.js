const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  //create a transporter.
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //MAIL-OPTIONS...
  const mailOptions = {
    from: 'venus bastola <venusbastola27@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send email...
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
