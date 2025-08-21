const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('Database setup completed successfully!');
    console.log('Tables created: users, tradespeople, tradesperson_portfolio, tradesperson_reviews,');
    console.log('                tradesperson_availability, tradesperson_quotes, categories, jobs,');
    console.log('                job_applications, reviews');
    console.log('Default categories inserted');
    console.log('Indexes created for performance');
    console.log('Mock verification system enabled for tradespeople');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
    
    // Check if tables already exist
    if (error.message.includes('already exists')) {
      console.log('Tables already exist, skipping setup...');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);

