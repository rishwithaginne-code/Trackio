const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.static(__dirname));

// Facilities Data
const facilities = [
  {
    id: 1,
    name: "Coffee Shop",
    category: "cafe",
    lat: 17.4399,
    lng: 78.4983,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80",
    description: "Level 1, Near Entrance. Fresh coffee and snacks available."
  },
  {
    id: 2,
    name: "Restrooms",
    category: "restroom",
    lat: 17.4402,
    lng: 78.4985,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80",
    description: "Clean public restrooms available for all passengers."
  },
  {
    id: 3,
    name: "Ticket Counter",
    category: "ticket",
    lat: 17.4395,
    lng: 78.4980,
    image: "https://images.unsplash.com/photo-1563853110287-25e1cc454bf5?auto=format&fit=crop&w=300&q=80",
    description: "Main Hall. Buy and cancel tickets here."
  },
  {
    id: 4,
    name: "Waiting Area",
    category: "waiting",
    lat: 17.4405,
    lng: 78.4988,
    image: "https://images.unsplash.com/photo-1510255470535-6ad6293427be?auto=format&fit=crop&w=300&q=80",
    description: "Air-conditioned waiting area for ticket holders."
  },
  {
    id: 5,
    name: "Elevators",
    category: "elevator",
    lat: 17.4401,
    lng: 78.4982,
    image: "https://images.unsplash.com/photo-1513009762141-860f4e389eec?auto=format&fit=crop&w=300&q=80",
    description: "Access to Platforms 1, 2, and 3."
  },
  {
    id: 6,
    name: "Escalators",
    category: "escalator",
    lat: 17.4397,
    lng: 78.4987,
    image: "https://images.unsplash.com/photo-1584982645607-4e6f4779a1f1?auto=format&fit=crop&w=300&q=80",
    description: "Moving stairs to upper platforms."
  },
  {
    id: 7,
    name: "Security Desk",
    category: "security",
    lat: 17.4396,
    lng: 78.4979,
    image: "https://images.unsplash.com/photo-1530680693898-34f3b7baefc4?auto=format&fit=crop&w=300&q=80",
    description: "Main Hall. For any assistance and reporting suspicious items."
  },
  {
    id: 8,
    name: "Drinking Water",
    category: "water",
    lat: 17.4408,
    lng: 78.4981,
    image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=300&q=80",
    description: "Purified drinking water fountain."
  },
  {
    id: 9,
    name: "Main Exit",
    category: "exit",
    lat: 17.4390,
    lng: 78.4984,
    image: "https://images.unsplash.com/photo-1563853110287-25e1cc454bf5?auto=format&fit=crop&w=300&q=80",
    description: "Exit towards city bus station."
  }
];

// API Endpoints
app.get('/api/facilities', (req, res) => {
  res.json(facilities);
});

// Serve home page first on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
