const express = require('express');
const app = express();

app.use(require('cors')());

app.use(express.json());

app.use('/api/v1/comments', require('./routes/comments'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
