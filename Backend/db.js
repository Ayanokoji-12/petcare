
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const isAiven = process.env.DB_SSL === "true";

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),

    ...(isAiven && {
        ssl: {
            ca: process.env.DB_SSL_CA
                ? process.env.DB_SSL_CA.replace(/\\n/g, "\n")
                : fs.readFileSync(path.join(__dirname, "ca.pem"), "utf8"),
            rejectUnauthorized: true
        }
    }),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
