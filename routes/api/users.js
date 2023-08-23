const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const authenticate = require('../../config/config_passport');

const User = require('../../schemas/user');
require('dotenv').config();
const auth = require("../../middlewares/auth");
const secret = process.env.SECRET;
const { validateToken, invalidatedTokens } = require("../../middlewares/token");
const gravatar = require('gravatar');
const jimp = require('jimp');
const path = require('path');
const fs = require('fs/promises'); 


const tmpUpload = require('../../middlewares/multerTmp');
const publicUpload = require('../../middlewares/multerPublic');


router.post("/login", async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  console.log(user)

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Incorrect login or password',
      data: 'Bad request',
    })
  }

  const payload = {
    id: user.id,
    username: user.username,
  }

  const token = jwt.sign(payload, secret, { expiresIn: '1h' })
  res.json({
    status: 'success',
    code: 200,
    data: {
      token,
    },
  })
})

// router.post("/users/registration", async (req, res, next) => {
//   const { username, email, password } = req.body
//   const user = await User.findOne({ email })
//   if (user) {
//     return res.status(409).json({
//       status: 'error',
//       code: 409,
//       message: 'Email is already in use',
//       data: 'Conflict',
//     })
//   }
//   try {
//     const newUser = new User({ username, email })
//     newUser.setPassword(password)
//     await newUser.save()
//     res.status(201).json({
//       status: 'success',
//       code: 201,
//       data: {
//         message: 'Registration successful',
//       },
//     })
//   } catch (error) {
//     next(error)
//   }
// })

router.get("/list", auth, (req, res, next) => {
  const { username } = req.user
  res.json({
    status: 'success',
    code: 200,
    data: {
      message: `Authorization was successful: ${username}`,
    },
  })
})

// Route to logout (using GET method as per the original requirement)
router.get("/logout", validateToken, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  invalidatedTokens.add(token);
  console.log(Array.from(invalidatedTokens));

  res.status(204).json({
    status: "success",
    code: 204,
    message: "Successfully logout",
    data: "success",
  });
});

// New route for getting the current user
router.get("/current", auth, async (req, res, next) => {
  const { email } = req.user;
  
  try {
    // Retrieve the user's subscription from the database
    const user = await User.findOne({ email });

  res.status(200).json({
    status: 'success',
    code: 200,
    data: {
      email: user.email,
      subscription: user.subscription,
    },
  });
} catch (error){
  next(error);
}
});

router.patch("/users", validateToken, auth, async (req, res, next) => {
  const validSubscriptions = ['starter', 'pro', 'business'];

  const { subscription } = req.body;

  if (!validSubscriptions.includes(subscription)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Invalid subscription value',
      data: null,
    });
  }

  const userId = req.user._id;

  try {
    // Update the user's subscription in the database
    const user = await User.findById(userId);
    user.subscription = subscription;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Subscription updated successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Avatars

router.post("/registration", publicUpload.single('avatarURL'), async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  

  if (user) {
    return res.status(409).json({
      status: 'error',
      code: 409,
      message: 'Email is already in use',
      data: 'Conflict',
    });
  }

  try {
    let avatarURL = '';
    if (req.file) {
      // Si se proporciona un archivo, usa ese archivo como avatar
      avatarURL = `/avatars/${req.file.filename}`;
    } else {
      // Si no se proporciona un archivo, usa Gravatar
      avatarURL = gravatar.url(email, { s: '200', r: 'pg', d: 'identicon' });
    }

    const newUser = new User({ username, email, avatarURL });
    newUser.setPassword(password);
    await newUser.save();

    res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        message: 'Registration successful',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/avatars', authenticate, validateToken, tmpUpload.single('avatar'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    // Process the uploaded avatar
    const imagePath = req.file.path;
    const avatarImage = await jimp.read(imagePath);
    await avatarImage.resize(250, 250);

    // Generate a unique filename for the avatar
    const avatarFilename = `${Date.now()}_${req.file.originalname}`;
    
    // Define the destination path for the avatar in the "public/avatars" folder
    
    const avatarPath = path.join('public', 'avatars', avatarFilename);

    // Write the resized avatar image to the destination path
    await avatarImage.writeAsync(avatarPath);

    // Update the user's avatarURL field in the database
    const userId = req.user._id; 
    console.log(userId); // Assuming you have access to the user's ID from the token
    const user = await User.findByIdAndUpdate(userId, { avatarURL: `/avatars/${avatarFilename}` }, { new: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // user.avatarURL = `/avatars/${avatarFilename}`;
    // await user.save();

     // Delete the temporary file
     await fs.unlink(imagePath);

    // Return the avatarURL in the response
    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;