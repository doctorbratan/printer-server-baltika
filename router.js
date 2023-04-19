const printer = require('./printer');

const express = require('express');
const router = express.Router();

// Печать Чека
// localhost:3000/printer/order
router.post('/order', printer.order);

// Печать Задния
// localhost:3000/printer/task
router.post('/task', printer.task);

module.exports = router;