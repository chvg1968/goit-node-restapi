const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");

const contactFilePath = "models/contacts.json";

const readContacts = async () => {
  const contactList = await fs.readFile(contactFilePath);
  return JSON.parse(contactList.toString());
};

const writeContacts = async (contacts) => {
  await fs.writeFile(contactFilePath, JSON.stringify(contacts, null, 2));
};

const listContacts = async () => {
  const contacts = await readContacts();
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await readContacts();
  const filteredContact = contacts.filter((contact) => contact.id === contactId);
  return filteredContact;
};

const removeContact = async (contactId) => {
  let contacts = await readContacts();
  contacts = contacts.filter((contact) => contact.id !== contactId);
  await writeContacts(contacts);
};

const addContact = async (contact) => {
  const contacts = await readContacts();
  const newContact = { id: uuidv4(), ...contact };
  contacts.push(newContact);
  await writeContacts(contacts);
  return newContact;
};

const updateContact = async (contactId, updatedFields) => {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updatedFields };
    await writeContacts(contacts);
    return contacts[index];
  }
  return null;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
// Compare this snippet from routes/api/contacts.js: