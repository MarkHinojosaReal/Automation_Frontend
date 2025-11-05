const express = require('express');
const router = express.Router();

// POST /api/automations - Create a new automation
router.post('/', async (req, res) => {
  try {
    const { name, initiative, platform } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Name is required' 
      });
    }
    
    console.log(`➕ Creating new automation: ${name}`);
    
    const { Client } = require('pg');
    
    // Validate required environment variables
    if (!process.env.POSTGRES_PASSWORD) {
      console.error('❌ POSTGRES_PASSWORD environment variable is required');
      throw new Error('POSTGRES_PASSWORD environment variable is required');
    }
    
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    console.log('✅ Connected to Postgres database');

    // Insert query - is_active defaults to false
    const query = `
      INSERT INTO src.automations (automation_name, initiative, platform, is_active)
      VALUES ($1, $2, $3, false)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      name.trim(), 
      initiative?.trim() || null, 
      platform?.trim() || null
    ]);
    
    const automation = result.rows[0];
    console.log(`✅ Successfully created automation with ID: ${automation.id}`);

    await client.end();
    console.log('✅ Database connection closed');
    
    res.status(201).json(automation);
    
  } catch (error) {
    console.error('💥 Error creating automation:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/automations - Fetch all automations
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching automations from Postgres');
    
    const { Client } = require('pg');
    
    // Validate required environment variables
    if (!process.env.POSTGRES_PASSWORD) {
      console.error('❌ POSTGRES_PASSWORD environment variable is required');
      throw new Error('POSTGRES_PASSWORD environment variable is required');
    }
    
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log(`🔗 Connecting to database: ${process.env.POSTGRES_USER}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DATABASE}`);

    await client.connect();
    console.log('✅ Connected to Postgres database');

    // Query to get all automations
    const query = `
      SELECT 
        id,
        platform,
        automation_name,
        is_active,
        initiative,
        created_at
      FROM src.automations
      ORDER BY platform ASC, initiative ASC, automation_name ASC
    `;
    
    const result = await client.query(query);
    const automations = result.rows;
    console.log(`📊 Found ${automations.length} automation records`);

    await client.end();
    console.log('✅ Database connection closed');
    
    res.json(automations);
    
  } catch (error) {
    console.error('💥 Error fetching automations:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/automations/:id - Update automation is_active status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    // Validate input
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ 
        error: 'is_active must be a boolean value' 
      });
    }
    
    console.log(`🔄 Updating automation ${id} is_active to ${is_active}`);
    
    const { Client } = require('pg');
    
    // Validate required environment variables
    if (!process.env.POSTGRES_PASSWORD) {
      console.error('❌ POSTGRES_PASSWORD environment variable is required');
      throw new Error('POSTGRES_PASSWORD environment variable is required');
    }
    
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    console.log('✅ Connected to Postgres database');

    // Update query
    const query = `
      UPDATE src.automations
      SET 
        is_active = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [is_active, id]);
    
    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ 
        error: `Automation with id ${id} not found` 
      });
    }
    
    const automation = result.rows[0];
    console.log(`✅ Successfully updated automation ${id}`);

    await client.end();
    console.log('✅ Database connection closed');
    
    res.json(automation);
    
  } catch (error) {
    console.error('💥 Error updating automation:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

