const express = require('express');
const router = express.Router();
const { registerUser, verifyUser, resendVerificationEmail } = require('../../controllers/userController');
require('dotenv').config();



router.post('/register', registerUser);
router.get('/verify/:verificationToken', verifyUser);
router.post('/verify', resendVerificationEmail);




module.exports = router;