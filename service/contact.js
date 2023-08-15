const Contact = require("../schemas/contacts");

const getAllContacts = async ({ owner, page, limit, favorite }) => {
  const startIndex = (page - 1) * limit;
  
  // Construct the query condition based on owner and favorite
  const query = { owner };
  if (favorite !== undefined) {
    query.favorite = favorite; // Convert "true" string to boolean
  }

  try {
    // Fetch contacts with pagination and optional filtering by favorite
    const contacts = await Contact.find(query)
      .skip(startIndex)
      .limit(limit)
      .exec();

  // Fetch total count of contacts (with or without filtering by favorite) for pagination info
  const totalContacts = await Contact.countDocuments(query);

  const totalPages = Math.ceil(totalContacts / limit);

  return {
    contacts,
    currentPage: page,
    totalPages,
    totalContacts
  };
} 
catch (error) {
  // Handle any errors that occur during the database query
  console.error(error);
  throw new Error('An error occurred while fetching contacts.');
}
};


const createContact = ({ name, email, phone, favorite, owner }) => {
  return Contact.create({ name, email, phone, favorite,  owner });
};

module.exports = {
  getAllContacts,
  createContact,
};
