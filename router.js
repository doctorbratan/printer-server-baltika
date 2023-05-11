const printer = require('./printer');

const express = require('express');
const router = express.Router();

// Показать принетера
// localhost:3000/printer
router.get('/', printer.get);


// Есть ли принтер в сети
// localhost:3000/printer/:name
router.get('/:name', printer.get);

// Печать Чека
// localhost:3000/printer/order
router.post('/order', printer.order);

// Печать Задния
// localhost:3000/printer/task
router.post('/task', printer.task);

module.exports = router;