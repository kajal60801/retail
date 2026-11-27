const JsonStorageService = require('../services/jsonStorageService');

const submitMessage = async (req, res) => {
  const { fullName, phone, email, message } = req.body;
  if (!fullName || !phone || !message) {
    return res.status(400).json({ message: 'Full Name, Phone, and Message are required.' });
  }

  const messages = await JsonStorageService.readData('messages');
  const newMessage = {
    id: `msg-${Date.now()}`,
    fullName,
    phone,
    email: email || 'N/A',
    message,
    createdAt: new Date().toISOString()
  };

  messages.unshift(newMessage);
  await JsonStorageService.writeData('messages', messages);
  res.status(201).json({ message: 'Message sent successfully!', data: newMessage });
};

const getMessages = async (req, res) => {
  const messages = await JsonStorageService.readData('messages');
  res.json(messages);
};

module.exports = { submitMessage, getMessages };