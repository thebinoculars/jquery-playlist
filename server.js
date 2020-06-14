require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));

app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname }/dist/index.html`));
});
