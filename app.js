const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello DevOps World! 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
