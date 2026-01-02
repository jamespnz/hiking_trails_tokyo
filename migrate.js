require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function migrate() {
    const results = [];
    const csvFile = 'tokyo_railway_destinations_utf8_bom.csv';

    if (!fs.existsSync(csvFile)) {
        console.error(`ERROR: ${csvFile} is missing from this folder!`);
        return;
    }

    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`Parsed ${results.length} rows. Uploading to Supabase...`);
            const { error } = await supabase.from('trails').insert(results);
            if (error) console.error('Migration Error:', error);
            else console.log('Successfully migrated 13 trails to Supabase!');
        });
}
migrate();