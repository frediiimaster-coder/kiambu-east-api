const express = require('express');
const cors = require('cors');
const app = express();

// MIDDLEWARE
app.use(cors()); // allows your App Inventor app to connect
app.use(express.json()); // lets us read JSON from your app

// "DATABASE" - for now we store in memory
let rentals = []; 

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('Kiambu East Rental API is Live ✅');
});

// 1. POST - SAVE NEW RENTAL FROM YOUR APP
app.post('/rentals', (req, res) => {
  const { title, price, location, contact } = req.body;
  
  if (!title || !price || !location || !contact) {
    return res.status(400).json({ error: "All fields required" });
  }

  const newRental = {
    id: Date.now(),
    title,
    price,
    location, 
    contact,
    bedrooms: "1",
    bathrooms: "1",
    verified: false,
    createdAt: new Date()
  };

  rentals.push(newRental);
  res.status(201).json({ message: "Rental added successfully", data: newRental });
});

// 2. GET - GET ALL RENTALS FOR HOME SCREEN
app.get('/rentals', (req, res) => {
  res.status(200).json(rentals);
});

// 3. GET - GET ONE RENTAL BY ID
app.get('/rentals/:id', (req, res) => {
  const rental = rentals.find(r => r.id == req.params.id);
  if (!rental) return res.status(404).json({ error: "Rental not found" });
  res.status(200).json(rental);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kiambu East Rental API running on ${PORT}`));
