/**
 * This module contains functions related to `user` database operations.
 */





var q = require ("q");


/**
 * Wrapper function that allow access to MYSQL package and Database Connection Pool to every function.	
 * @param  {Object} mysql
 * @param  {Object} pool  
 * @return {Object} containing all helper methods to be exported.
 */
module.exports = function (mysql, pool) {
	var exports = {};

	/**
	 * Private function that gets user from database corresponding to username.
	 * @param  {String} username
	 * @return {Promise} resolves when user corresponding to username is found in database.
	 * 					 and resolves to USER object in form : 
	 * 					 {
	 * 						 "id" : <>,
	 * 						 "username" : <>,
	 * 						 "password" : <>
	 * 					 }
	 */
	function _getUser (username) {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
				console.log ("Mysql Server down.");
	           	deferred.reject (0);
	        } else {
	        	var sqlQuery = mysql.format("SELECT * FROM `user` WHERE `username`=?", [username]);
	           	connection.query(sqlQuery,function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else if (rows.length > 0) {
	              		deferred.resolve (rows [0]);
	              	} else {
	              		deferred.reject ();
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Gets user's username from database.
	 * @param  {Number} userId
	 * @return {Promise} resolves when user corresponding to userId is found in database.
	 * 					 and resolves to username. 
	 */
	exports.getUsernameById = function (userId) {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
					console.log ("Some Problem with DB.");
				}
	           	deferred.reject ();
	        } else {
	        	sqlQuery = mysql.format("SELECT `username` FROM `user` WHERE `id`=?", [userId]);
	           	connection.query(sqlQuery,function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else if (rows.length > 0) {
	              		deferred.resolve (rows [0]["username"]);
	              	} else {
	              		deferred.reject ();
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Private function to register user in database.
	 * @param  {String} username
	 * @param  {String} password
	 * @return {Promise} resolves when user is succesfully registered and resolves to userId of registered user.
	 */
	function _registerUser (username, password) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
        		sqlQuery = mysql.format("INSERT INTO `user` (`username`, `password`) VALUES (?, ?)", [username, password]);
	           	connection.query(sqlQuery,function(err, result){
              		connection.release();
	              	if (err) {
	              		deferred.reject (err);
	            	} else {
	            		deferred.resolve (result.insertId);
	            	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Registers User in database
	 * @param  {String} username
	 * @param  {String} password
	 * @return {Promise} resolves when that user is successfully registered 
	 * 					 and resolves to user object : 
	 * 					 {
	 * 					 	"id" : <user_id_of_newly_registered_user>,
	 * 					 	"username" : <username>
	 * 					 }
	 * 					 
	 */
	exports.registerUser = function (username, password) {
		var deferred = q.defer ();
		//Checks if username exists in database or not
		_getUser (username)
		.then (function (rows) {
			//if username alredy exists, than reject promise.
			deferred.reject ("This Username already exists.")
		},function (err) {
			if (err === 0) {
				return deferred.reject ("KABOOM! Mysql server gone.");
			}
			//if username doesn't exists, than register user using register helper function
			_registerUser (username, password)
			.then (function (userId) {
				deferred.resolve ({id : userId, username : username});
			}, function (err) {
				deferred.reject ("Oops! some error occured!");
			})
		});
		return deferred.promise;
	}

	/**
	 * function to authenticate user login.
	 * @param  {String} username
	 * @param  {String} password
	 * @return {Promise} resolves when user authentication is successful.
	 * 					 and resolves to USER object.
	 * 					 {
	 * 						 "id" : <>,
	 * 						 "username" : <>
	 * 					 }
	 */
	exports.login = function (username, password) {
		var deferred = q.defer ();
		//gets user object corresponding to username
		_getUser (username)
		.then (function (user) {
			//if user exists ,than match password.
			if (password !== user.password) {
				deferred.reject ("Password incorrect.");
			} else {
				delete user ["password"];
				deferred.resolve (user);
			}
		}, function (err) {
			if (err === 0) {
				return deferred.reject ("KABOOM! Mysql server gone.");
			}
			deferred.reject ("No Such username exists.")
		});
		return deferred.promise;
	}

	return exports;
}