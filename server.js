require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Configuration (Placeholder until Day 2)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API Route: Fetch Trails (Matches your CSV structure)
app.get('/api/trails', async (req, res) => {
    try {
        // This will fetch from your 'trails' table once seeded
        const { data, error } = await supabase.from('trails').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trail data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});