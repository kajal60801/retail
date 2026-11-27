const express = require('express');
const JsonStorageService = require('../services/jsonStorageService');
const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await JsonStorageService.readData('categories');
  res.json(categories);
});

module.exports = router;