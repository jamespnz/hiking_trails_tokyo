// 1. Safe Dotenv Loading
try {
    require('dotenv').config();
} catch (e) {
    console.log("Dotenv not found, using system environment variables.");
}

const express = require('express');
const path = require('path');

const publicPath = path.join(__dirname, 'public');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Supabase Configuration
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

// 3. Middleware
// If your HTML/CSS/JS are in the ROOT folder, use '.' 
// If they are in a folder called 'public', keep 'public'
// 3. Middleware
// We use 'publicPath' which you already defined at the top
app.use(express.static(publicPath)); 
app.use(express.json());

// 4. The Homepage Route
app.get('/', (req, res) => {
    // This explicitly tells Express to send the file from your public folder
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 5. API Route (Leave this exactly as you have it)
app.get('/api/trails', async (req, res) => {
    try {
        const { data, error } = await supabase.from('trails').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Supabase Error:", err.message);
        res.status(500).json({ error: 'Failed to fetch trail data' });
    }
});

// 6. Start Server (Ensure this is at the VERY bottom)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// This ensures that any request not caught by the API 
// or static files defaults back to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

window.sortTrails = () => {
    const container = document.getElementById('trail-grid');
    const cards = Array.from(container.getElementsByClassName('card'));
    const sortValue = document.getElementById('sort-time').value;

    if (sortValue === 'default') return;

    cards.sort((a, b) => {
        // We extract the number from the text "XX mins from Shinjuku"
        const timeA = parseInt(a.querySelector('p strong').innerText);
        const timeB = parseInt(b.querySelector('p strong').innerText);

        return sortValue === 'quickest' ? timeA - timeB : timeB - timeA;
    });

    // Re-append cards in the new order
    cards.forEach(card => container.appendChild(card));
};