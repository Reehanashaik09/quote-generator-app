const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Path to the local JSON database file
const DB_FILE = path.join(__dirname, 'favorites.json');

// Helper function to read favorites from the file
function getFavorites() {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database file:', error);
        return [];
    }
}

// Helper function to save favorites to the file
function saveFavorites(favorites) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(favorites, null, 2));
    } catch (error) {
        console.error('Error writing to database file:', error);
    }
}

// GET: Retrieve all saved favorite quotes
app.get('/api/favorites', (req, res) => {
    const favorites = getFavorites();
    res.json(favorites);
});

// POST: Save a new favorite quote
app.post('/api/favorites', (req, res) => {
    const { quote, author } = req.body;
    
    if (!quote) {
        return res.status(400).json({ error: 'Quote text is required' });
    }

    const favorites = getFavorites();
    
    // Create a new favorite object with a unique ID using timestamp
    const newFavorite = {
        id: Date.now(),
        quote: quote,
        author: author || 'Unknown'
    };

    // Add to the beginning of the array so newer favorites appear at the top
    favorites.unshift(newFavorite);
    saveFavorites(favorites);

    res.status(201).json(newFavorite);
});

// DELETE: Remove a favorite quote by its ID
app.delete('/api/favorites/:id', (req, res) => {
    const id = Number(req.params.id);
    let favorites = getFavorites();
    
    const initialLength = favorites.length;
    favorites = favorites.filter(fav => fav.id !== id);

    if (favorites.length === initialLength) {
        return res.status(404).json({ error: 'Favorite quote not found' });
    }

    saveFavorites(favorites);
    res.json({ success: true, message: 'Quote deleted successfully' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});