const Joi = require('joi');
const app = require('app');

const contactController = require('./controllers/contactController');
// Validation schema for POST and PUT requests
  
  const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });
  
  // Route to add a new contact
  app.post('/api/contacts', (req, res) => {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    } else {
      contactController.createContact(req, res); // Call the createContact controller function
    }
  });
  
  // Route to update a contact by id
  app.put('/api/contacts/:id', (req, res) => {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    } else {
      contactController.updateContactById(req, res); // Call the updateContactById controller function
    }
  });
  