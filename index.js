const port = 3000;
const routes = require('./router');

const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const express = require('express');
const app = express();


// Этот код добавляет заголовки CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Показывает API запросы
app.use(morgan('dev'));
app.use(cors());

// Расшифровка приходящих данных
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).json("Доступен!")
})

app.use('/printer', routes);

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Сервер запущен на порту: http://localhost:${port}`)
})
