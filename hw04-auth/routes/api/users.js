const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../../schemas/user')
require('dotenv').config()
const auth = require("../../middlewares/auth")
const secret = process.env.SECRET
const { validateToken, invalidatedTokens } = require("../../middlewares/token")


router.post("/users/login", async (req, res, next) => {
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

router.post("/users/registration", async (req, res, next) => {
  const { username, email, password } = req.body
  const user = await User.findOne({ email })
  if (user) {
    return res.status(409).json({
      status: 'error',
      code: 409,
      message: 'Email is already in use',
      data: 'Conflict',
    })
  }
  try {
    const newUser = new User({ username, email })
    newUser.setPassword(password)
    await newUser.save()
    res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        message: 'Registration successful',
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/users/list", auth, (req, res, next) => {
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
router.get("/users/logout", validateToken, (req, res) => {
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
router.get("/users/current", auth, async (req, res, next) => {
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




module.exports = router;