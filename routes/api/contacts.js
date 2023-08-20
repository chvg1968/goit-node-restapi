const express = require("express");
const { listContacts, getContactById, addContact, updateContact, removeContact } = require("../../models/contacts");
const { v4: uuidv4 } = require("uuid"); // Import the v4 function from uuid to generate a unique ID
const { validateToken } = require("../../middlewares/token");
const  auth = require("../../middlewares/auth");
const { createContact, getAllContacts } = require("../../service/contact")
const router = express.Router();

router.get("/", async (req, res, next) => {
  const contacts = await listContacts();
  res.json(contacts);
});

router.get("/:contactId", async (req, res, next) => {
  const results = await getContactById(req.params.contactId);
  if (results.length === 0) {
    res.status(404).json({ message: "Not found" });
  }
  res.json(results[0]);
});

router.post("/", async (req, res, next) => {
  // Assuming the request body contains the data for the new contact
  const { name, email, phone } = req.body;

  // Validate if all required fields are present in the request body
  if (!name || !email || !phone) {
    res.status(400).json({ message: "Missing required fields" });
  } else {
    // Generate a unique ID for the new contact using uuid
    const id = uuidv4();

    // Create the new contact object with the generated ID
    const newContact = { id, name, email, phone };
    
    // Add the new contact to the list of contacts using the addContact function
    await addContact(newContact);

    // Send a response indicating successful creation
    res.status(201).json({ message: "Contact created successfully", contact: newContact });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  // Check if the contact with the provided ID exists before attempting to delete
  const existingContact = await getContactById(contactId);

  if (existingContact.length === 0) {
    res.status(404).json({ message: "Contact not found" });
  } else {
    // Call the removeContact function to delete the contact
    await removeContact(contactId);

    res.json({ message: "Contact deleted successfully" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  // Assuming the request body contains the data to update the contact
  const { name, email, phone } = req.body;

  // Validate if at least one field to update is provided in the request body
  if (!name && !email && !phone) {
    res.status(400).json({ message: "Missing fields to update" });
  } else {
    // Get the existing contact by its ID
    const existingContact = await getContactById(contactId);

    // Check if the contact with the provided ID exists
    if (existingContact.length === 0) {
      res.status(404).json({ message: "Contact not found" });
    } else {
      // Merge the updated fields with the existing contact
      const updatedContact = {
        ...existingContact[0],
        name: name || existingContact[0].name,
        email: email || existingContact[0].email,
        phone: phone || existingContact[0].phone,
      };

      // Update the contact in the contacts.json file using the updateContact function
      await updateContact(contactId, updatedContact);

      // Send a response indicating successful update
      res.json({ message: "Contact updated successfully", contact: updatedContact });
    }
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
  const favorite = req.query.favorite === "true"; // Check if favorite filter is applied

  try {
    const results = await getAllContacts({ owner, page, limit, favorite });
    console.log(results);

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


// patch subscription


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
