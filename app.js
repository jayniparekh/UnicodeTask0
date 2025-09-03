const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const routes = require('./routes');

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

app.use('/', routes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});