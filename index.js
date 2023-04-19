const port = 3000;
const routes = require('./router');

const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const express = require('express');
const app = express();

// Показывает API запросы
app.use(morgan('dev'));
app.use(cors());

// Расшифровка приходящих данных
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

app.use('/printer', routes);

app.use(express.static('public'));


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});