import mysql from "mysql2/promise";

const db = mysql.createPool({
  connectionLimit: 10,
  host: "192.168.0.10",
  user: "xbmc",
  password: "xbmc",
  database: "MyVideos121",
  debug: false,
});

export default db;
