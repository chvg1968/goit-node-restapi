const express = require("express");
const { listContacts, getContactById, addContact, updateContact, removeContact } = require("../../models/contacts");
const { v4: uuidv4 } = require("uuid"); // Import the v4 function from uuid to generate a unique ID

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




module.exports = router;
