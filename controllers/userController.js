const User = require('../schemas/user');
const { sendVerificationEmail } = require('../utils/emailUtils');
const { generateVerificationToken } = require('../utils/tokenUtils');
const Joi = require('joi');


const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.verify) {
        return res.status(400).json({ message: 'Email is already verified' });
      } else {
        return res.status(400).json({ message: 'Email is already registered. A verification email has been sent.' });
      }
    }

    const verificationToken = generateVerificationToken();

    // Validate the verificationToken field
    const schema = Joi.object({
      verificationToken: Joi.string().required(),
    });

    const validation = schema.validate({ verificationToken });

    if (validation.error) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Create a new user with the verificationToken
    await User.create({ email, password, verificationToken });

    const verificationLink = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;

    await sendVerificationEmail(email, verificationLink);

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyUser = async (req, res) => {
  // Extract token from URL
  const verificationToken = req.params.verificationToken; 
  
  
  try {
    // find the user by token in data base
    const user = await User.findOne({ verificationToken });
    
     

    if (!user) {
      return res.status(404).send('Token de verificación no válido');
    }

    await User.updateOne(
      { verificationToken },
      { verify: true, verificationToken: null },
    );

    // Send response to client
    res.send('¡Suscripción confirmada!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la confirmación de suscripción');
  }
};



const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Valida que se proporciona un correo electrónico en el cuerpo de la solicitud
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const validation = schema.validate(req.body);

    if (validation.error) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    // Busca al usuario por correo electrónico
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (user.verify) {
      return res.status(400).json({ message: "Verification has already been passed" });
    }

    // Genera un nuevo token de verificación y envía el correo de verificación
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login a User (Only if email is verified)

const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.verify) {
      return res.status(401).json({ message: 'Email not verified. Please verify your email before logging in.' });
    }


    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { registerUser, verifyUser, resendVerificationEmail, loginUser };
