// get the client
const mysql = require('mysql2');
require('dotenv').config();
 
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'PL7d8LzW',
  database: 'employee_tracker'
});

module.exports = connection;