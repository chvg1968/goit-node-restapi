const express = require('express')
const router = express.Router()
const ctrlContact = require('../controller')



router.get('/contacts', ctrlContact.get)

router.get('/contacts/:id', ctrlContact.getById)

router.post('/contacts', ctrlContact.create)

router.put('/contacts/:id', ctrlContact.update)

// PATCH route to update contact favorite status
router.patch('/contacts/:contactId/favorite', ctrlContact.updateStatusContact)

router.delete('/contacts/:id', ctrlContact.remove)

module.exports = router