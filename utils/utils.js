const nodemailer = require("nodemailer");

function sendActivationEmail(email, activationToken) {
  // Configure Nodemailer transporter with your email service provider's settings

  const message = `

Congrats!

Your registration to E-Commerce is succesfull. The only thing you need to do is to click the link below to activate your account and start shopping!

Activate your account: ${process.env.SERVER_URL}/activate?token=${activationToken}

Sincerely

E-Commerce Team
`;
  sendEmail(email, "Activate Your E-Commerce Account", message);
}

const sendEmail = (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "Yandex",
    auth: {
      user: process.env.ADMIN_MAIL,
      pass: process.env.ADMIN_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.ADMIN_MAIL,
    to: email,
    subject: subject,
    text: message,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending activation email:", error);
    } else {
      console.log("Activation email sent:", info.response);
    }
  });
};

const { v4: uuidv4 } = require("uuid");

function generateActivationToken() {
  return uuidv4();
}

module.exports = {
  sendActivationEmail,
  generateActivationToken,
  sendEmail,
};
