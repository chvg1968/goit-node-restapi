const { listContacts, getContactById, addContact, removeContact, updateContact } = require('../models/contacts');

// Controller to get all contacts
const getAllContacts = async (req, res) => {
  const contacts = await listContacts();
  res.status(200).json(contacts);
};

// Controller to get a specific contact by id
const getContactByIdController = async (req, res) => {
  const { id } = req.params;
  const contact = await getContactById(id);
  if (contact.length > 0) {
    res.status(200).json(contact[0]);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
};

// Controller to add a new contact
const createContact = async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400).json({ message: 'missing required name field' });
  } else {
    const newContact = await addContact({ name, email, phone });
    res.status(201).json(newContact);
  }
};

// Controller to delete a contact by id
const deleteContact = async (req, res) => {
  const { id } = req.params;
  await removeContact(id);
  res.status(200).json({ message: 'Contact deleted successfully' });
};

// Controller to update a contact by id
const updateContactById = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  if (!name && !email && !phone) {
    res.status(400).json({ message: 'missing fields' });
  } else {
    const updatedContact = await updateContact(id, { name, email, phone });
    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  }
};

module.exports = {
  getAllContacts,
  getContactById: getContactByIdController,
  createContact,
  deleteContact,
  updateContactById,
};
