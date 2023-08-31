// emailUtils.js

const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const sendVerificationEmail = async (email, verificationLink) => {
    try {
      const info = await transporter.sendMail({
        from: '"Conrad V 👻" <conradovilla@gmail.com>',
        to: email, // email like argument
        subject: "Verificación de correo electrónico",
        text: `Haga clic en el siguiente enlace para verificar su correo electrónico: ${verificationLink}`,
        html: `<p>Haga clic en el siguiente enlace para verificar su correo electrónico:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      });
  
      console.log("Correo de verificación enviado: %s", info.messageId);
    } catch (error) {
      console.error("Error al enviar el correo de verificación:", error);
    }
  };
  


module.exports = { sendVerificationEmail };
