const bcrypt = require('bcryptjs');
const pool = require('./dbconnect');

const seedAdmin = async () => {
  try {
    // Check if admin exists
    const check = await pool.query("SELECT * FROM users WHERE email = 'admin@store.com'");
    
    if (check.rows.length > 0) {
      console.log('Admin already exists');
      console.log('Email: admin@store.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Create admin
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)',
      ['Administrator System Admin', 'admin@store.com', hashedPassword, 'Admin Address', 'admin']
    );

    console.log('Admin created successfully!');
    console.log('Email: admin@store.com');
    console.log('Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
