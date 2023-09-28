import "dotenv/config";
import mysql from "mysql";

// Configure database
export const db = mysql.createConnection({
  host: process.env.REACT_APP_DB_HOST,
  user: process.env.REACT_APP_DB_USER,
  password: process.env.REACT_APP_DB_PSWD,
  database: process.env.REACT_APP_DB_NAME,
});

db.connect(function (error) {
  if (error) throw error;
  console.log("Database connected to server");
});
