const fs = require("fs/promises");

const listContacts = async () => {
  const contactList = await fs.readFile("models/contacts.json");
  return JSON.parse(contactList.toString());
};

const getContactById = async (contactId) => {
  const contactList = await listContacts();
  const filteredContact = contactList.filter(
    (contact) => contact.id === contactId
  );
  return filteredContact;
};

const removeContact = async (contactId) => {};

const addContact = async (body) => {};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
