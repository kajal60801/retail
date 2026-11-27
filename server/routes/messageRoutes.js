const express = require('express');
const { submitMessage, getMessages } = require('../controllers/messageController');
const router = express.Router();

router.post('/', submitMessage);
router.get('/', getMessages);

module.exports = router;