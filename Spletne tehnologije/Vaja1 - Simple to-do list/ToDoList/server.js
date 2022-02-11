const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

const app = express();
app.use(bodyParser.json());
app.use(cors());

//Route imports
const tasksRoute = require('./routes/tasks');
const listsRoute = require('./routes/lists');

//Use routes
app.use('/tasks', tasksRoute);
app.use('/lists', listsRoute);

mongoose.connect(process.env.DB_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
    .then(() => console.log('DB connected'))
    .catch(err => console.log(err));

app.listen(5000, () => console.log('Server listening on port 5000'));
