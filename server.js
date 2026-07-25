const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // to serve admin.html

let news = [];
let members = [];
let events = [];

// NEWS
app.get('/news', (req, res) => res.json(news));
app.post('/news', (req, res) => {
  const newItem = { id: Date.now(),...req.body };
  news.push(newItem);
  res.json(newItem);
});

// MEMBERS
app.get('/members', (req, res) => res.json(members));
app.post('/members', (req, res) => {
  const newItem = { id: Date.now(),...req.body };
  members.push(newItem);
  res.json(newItem);
});

// EVENTS
app.get('/events', (req, res) => res.json(events));
app.post('/events', (req, res) => {
  const newItem = { id: Date.now(),...req.body };
  events.push(newItem);
  res.json(newItem);
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
