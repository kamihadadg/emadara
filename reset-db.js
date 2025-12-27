const sql = require('mssql');

// Database configuration - update these values according to your setup
const config = {
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'password',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'company_portal',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);

    const dbName = config.database;
    console.log(`📝 Resetting database: ${dbName}`);

    // Drop database if exists and recreate
    await sql.query(`
      IF EXISTS (SELECT name FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${dbName}];
      END
    `);

    console.log('✅ Database dropped successfully');

    await sql.query(`CREATE DATABASE [${dbName}]`);
    console.log('✅ Database created successfully');

    console.log('🎉 Database reset complete!');
    console.log('📋 Next steps:');
    console.log('   1. Restart your backend application');
    console.log('   2. The application will auto-create the admin user');
    console.log('   3. You can then create positions and users through the admin panel');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await sql.close();
  }
}

resetDatabase();
