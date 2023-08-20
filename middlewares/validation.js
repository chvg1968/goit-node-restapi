const Joi = require('joi');
const app = require('../../app');
const service = require('../../service');

// Validation schema for POST and PUT requests
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean().required(),
});

// Route to add a new contact
app.post('/api', (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  } else {
    service.createContact(req, res); // Call the createContact controller function
  }
});

// Route to update a contact by id
app.put('/api/:id', (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  } else {
    service.updateContactById(req, res); // Call the updateContactById controller function
  }
});

// Route to update contact favorite status using PATCH
app.patch('/api/:contactId/favorite', (req, res) => {
  service.updateStatusContact(req.params.contactId, req.body)
    .then(updatedContact => {
      if (updatedContact) {
        res.json({
          status: 'success',
          code: 200,
          data: { contact: updatedContact },
        });
      } else {
        res.status(404).json({
          status: 'error',
          code: 404,
          message: `Not found contact id: ${req.params.id}`,
          data: 'Not Found',
        });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

module.exports = app;
