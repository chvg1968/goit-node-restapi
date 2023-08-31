const { nanoid } = require('nanoid');


const generateVerificationToken = () => {
  const tokenLength = 10;
  const verificationToken = nanoid(tokenLength);
  return verificationToken;
};

module.exports = { generateVerificationToken }; 
