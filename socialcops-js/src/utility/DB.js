/**
 * This module creates Database Connection pool for our app.
 */

var credentials = require ("../DBCredentials");

module.exports = function (mysql) {
	var pool = mysql.createPool({
		connectionLimit : 100,
		host : credentials.HOST || "localhost",
		user : credentials.USER_NAME || "root",
		password : credentials.PASSWORD || "",
		database : credentials.DATABASE_NAME || "gossipgirl",
		debug : false
	});
	return pool;
}