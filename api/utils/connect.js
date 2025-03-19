import mysql from "mysql2/promise";
import "dotenv/config";

// Configure database
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSWD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection and manage errors
async function testConnection() {
  try {
    const [rows, fields] = await db.query("SELECT 1");
    console.log("Database connected to server");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw new Error(
      "Failed to connect to database. Application cannot start."
    );
  }
}

testConnection();
