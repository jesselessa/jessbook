import "dotenv/config";
import mysql from "mysql";

// Configure database
export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSWD,
  database: process.env.DB_NAME,
});

db.connect(function (error) {
  if (error) throw error;
  console.log("Database connected to server");
});
