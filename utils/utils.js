const nodemailer = require("nodemailer");

function sendActivationEmail(email, activationToken) {
  // Configure Nodemailer transporter with your email service provider's settings
  const transporter = nodemailer.createTransport({
    service: "Yandex",
    auth: {
      user: "erhan@workintech.com.tr",
      pass: "Workintech34728",
    },
  });

  // Email content
  const mailOptions = {
    from: "erhan@workintech.com.tr",
    to: email,
    subject: "Activate Your Account",
    text: `Click the following link to activate your account: 
           http://yourwebsite.com/activate?token=${activationToken}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending activation email:", error);
    } else {
      console.log("Activation email sent:", info.response);
    }
  });
}

const { v4: uuidv4 } = require("uuid");

function generateActivationToken() {
  return uuidv4();
}

module.exports = {
  sendActivationEmail,
  generateActivationToken,
};
