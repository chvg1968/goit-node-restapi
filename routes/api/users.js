const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../../schemas/user')
require('dotenv').config()
const auth = require("../../middlewares/auth")
const secret = process.env.SECRET
const { createContact, getAllContacts } = require("../../service/contact")
const Contact = require("../../schemas/contacts")

const invalidatedTokens = new Set();

const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (invalidatedTokens.has(token)) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Unathorized: Invalid token",
      data: "Unathorized",
    });
  }

  next();
};



router.post("/users/login", async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

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

router.post("/contacts", validateToken, auth, async (req, res, next) => {
  const { name, email, phone, favorite } = req.body;
  const owner = req.user._id;

  try {
    const result = await createContact({ name, email, phone , favorite, owner });

    res.status(201).json({
      status: "created",
      code: 201,
      data: { cat: result },
    });
  } catch (error) {
    next(error);
  }
});


// pagination max 20 
router.get("/contacts", validateToken, auth, async (req, res, next) => {
  const owner = req.user._id;
  const page = parseInt(req.query.page) || 1; // default page is 1
  const limit = parseInt(req.query.limit) || 20; // default limit is 20

  try {
    const results = await getAllContacts({ owner, page, limit });

    res.json({
      status: "success",
      code: 200,
      data: {
        contact: results,
      },
    });
  } catch (error) {
    next(error);
  }
});

// filtered contacts by favorite
// router.get('/contacts', validateToken, auth, async (req, res) => {
//   try {
//     const { _id: owner } = req.user;
//     const { page = 1, limit = 10 } = req.query; // Remove favorite from here
//     const skip = (page - 1) * limit;

//     const { favorite = true } = req.query; // Extract favorite with default value

//     let filter = null;
//     if (favorite === "false" || favorite === "true") {
//       const isFavoriteTrue = favorite === "true";
//       filter = { favorite: isFavoriteTrue };
//     }

//     const result = await Contact.find(
//       { owner, ...filter },
//       "-createdAt -updatedAt",
//       {
//         skip,
//         limit,
//       }
//     ).populate("owner", "name email");

//     res.json({ result, favorite }); // Include favorite in the response
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/contacts", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Requested page
    const perPage = parseInt(req.query.perPage) || 10; // Number of items per page
    
    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    console.log(req.query);

    // Filter only for favorite contacts
    const filter = { ...req.query, favorite: true };

    const totalResults = await Contact.countDocuments(filter);
    const result = await Contact.find(filter)
      .skip(startIndex)
      .limit(perPage);

    // Build response object with pagination information
    const response = {
      status: "success",
      page,
      perPage,
      totalResults,
      data: {
        result
      }
    };

    // Add link to previous page if applicable
    if (startIndex > 0) {
      response.prevPage = page - 1;
    }

    // Add link to next page if applicable
    if (endIndex < totalResults) {
      response.nextPage = page + 1;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





// patch subscription
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

// Random contacts to test the pagination
router.post("/randomContacts", validateToken, auth, async (req, res, next) => {
  const { numberOfContacts, owner } = req.body;

  try {
    // Generate random contacts with the specified owner ID
    const randomContacts = generateRandomContacts(numberOfContacts, owner);
    

    // Insert the generated contacts into the database
    for (const contact of randomContacts) {
      await createContact(contact);
    }


    res.status(201).json({
      status: "created",
      code: 201,
      data: { message: `${numberOfContacts} random contacts generated.` },
    });
  } catch (error) {
    next(error);
  }
});

function generateRandomContacts(count, owner) {
  const randomContacts = [];
  for (let i = 1; i <= count; i++) {
    const contact = {
      name: `Contact ${i}`,
      email: `contact${i}@example.com`,
      phone: '123-456-7890',
      favorite: Math.random() < 0.5, // Randomly set as true or false
      owner: owner, // Set the owner to the specified owner ID
    };
    randomContacts.push(contact);
  }
  return randomContacts;
}


module.exports = router;