
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the "HTML" directory
app.use(express.static(path.join(__dirname, 'HTML')));



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
