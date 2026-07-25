const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// FAKE DATABASE - for now
let news = [];
let members = [];
let events = [];

// 1. HOME ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'Kiambu East API is running!' });
});

// 2. HEALTH ROUTE
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 3. NEWS ROUTES
app.get('/news', (req, res) => {
  res.json(news);
});
app.post('/news', (req, res) => {
  const newItem = { id: Date.now(), ...req.body };
  news.push(newItem);
  res.json(newItem);
});

// 4. MEMBERS ROUTES
app.get('/members', (req, res) => {
  res.json(members);
});
app.post('/members', (req, res) => {
  const newMember = { id: Date.now(), ...req.body };
  members.push(newMember);
  res.json(newMember);
});

// 5. EVENTS ROUTES
app.get('/events', (req, res) => {
  res.json(events);
});
app.post('/events', (req, res) => {
  const newEvent = { id: Date.now(), ...req.body };
  events.push(newEvent);
  res.json(newEvent);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
