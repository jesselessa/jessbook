import mysql from "mysql2/promise";

// Create a connection pool using mysql2/promise and name it 'db'
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSWD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Function to execute a query using the 'db' connection pool
export async function executeQuery(query, values = []) {
  try {
    const [rows] = await db.execute(query, values);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error; // Re-throw error to handle it in calling function
  }
}

// Log connection success (or failure) only on app start
export const connectDB = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected to server");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};
