// 1. Safe Dotenv Loading
try {
    require('dotenv').config();
} catch (e) {
    console.log("Dotenv not found, using system environment variables.");
}

const express = require('express');
const path = require('path');
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
app.use(express.static(path.join(__dirname, '.'))); 
app.use(express.json());

// 4. API Route
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

// 5. Start Server
// Using '0.0.0.0' allows Railway's internal network to find your app
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});