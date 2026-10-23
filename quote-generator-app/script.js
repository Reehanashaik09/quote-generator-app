const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');

const API_URL = 'http://localhost:5000/api/favorites';

let currentQuote = {
    quote: "Click the button below to generate a quote!",
    author: "Author"
};

// Fetch a random public quote
async function getRandomQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        currentQuote = {
            quote: data.content,
            author: data.author
        };
        quoteText.textContent = `"${currentQuote.quote}"`;
        quoteAuthor.textContent = `- ${currentQuote.author}`;
    } catch (error) {
        // Fallback if network/API fails
        const fallbackQuotes = [
            { quote: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { quote: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", author: "Winston Churchill" },
            { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers" }
        ];
        const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        currentQuote = random;
        quoteText.textContent = `"${currentQuote.quote}"`;
        quoteAuthor.textContent = `- ${currentQuote.author}`;
    }
}

// Load saved favorites from backend server
async function fetchFavorites() {
    try {
        const response = await fetch(API_URL);
        const favorites = await response.json();
        renderFavorites(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

// Render favorites list
function renderFavorites(favorites) {
    historyList.innerHTML = '';
    if (favorites.length === 0) {
        historyList.innerHTML = '<li style="justify-content: center; color: #7f8c8d;">No saved favorites yet.</li>';
        return;
    }

    favorites.forEach(fav => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>"${fav.quote}" — <strong>${fav.author}</strong></span>
            <button onclick="deleteFavorite(${fav.id})">❌</button>
        `;
        historyList.appendChild(li);
    });
}

// Save current quote to backend
favoriteBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentQuote)
        });
        if (response.ok) {
            fetchFavorites();
        }
    } catch (error) {
        console.error('Error saving favorite:', error);
    }
});

// Delete a favorite by ID
async function deleteFavorite(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchFavorites();
        }
    } catch (error) {
        console.error('Error deleting favorite:', error);
    }
}

// Copy quote to clipboard
copyBtn.addEventListener('click', () => {
    const textToCopy = `"${currentQuote.quote}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(textToCopy);
    alert('Quote copied to clipboard!');
});

newQuoteBtn.addEventListener('click', getRandomQuote);

// Initial load
getRandomQuote();
fetchFavorites();