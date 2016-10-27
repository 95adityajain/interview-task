/**
 * This module contains functions related to `user_subscription` database operations.
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
	 * Private function get all users from database
	 * @return {Promise} resolves to :
	 * 					 {
	 * 					 	"user_id" : {
	 * 					 		"username" : <>
	 * 					 	},
	 * 					 	......
	 * 					 }
	 */
	function _getAllUsers () {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
	           	connection.query("SELECT `id`, `username` FROM `user`",function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else {
	              		rows = rows.reduce (function (acc, row) {
	              			acc [row ["id"]] = {username : row ["username"]};
	              			return acc;
	              		}, {});
	              		deferred.resolve (rows);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Private function to get all user fields, that other user can subscribe to from database.
	 * @return {Promise} resolves to : 
	 * 					 {
	 * 					 	"user_id" : {
	 * 					 		"<user_field_name>" : <>,
	 * 					 		....
	 * 					 	},
	 * 					 	......
	 * 					 }
	 */
	function _getAllUserFields () {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
	           	connection.query("SELECT `user_id`, `field_name` FROM `user_fields`",function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else {
	              		//reduces returned RowPackets(rows) array to above defined format.
	              		rows = rows.reduce (function (acc, row) {
	              			if (!acc [row ["user_id"]]) {
	              				acc [row ["user_id"]] = {};
	              			}
	              			acc [row ["user_id"]][row ["field_name"]] = 0;
	              			return acc;
	              		}, {});
	              		deferred.resolve (rows);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Private function to get user's subscription (all fields of other user's that this user is subscribe to) from database.
	 * @param  {Number} userId
	 * @return {Promise} resolves to : 
	 * 					 {
	 * 					 	"user_id" : {
	 * 					 		"<user_field_name>" : <>,
	 * 					 		....
	 * 					 	},
	 * 					 	.....
	 * 					 }
	 */
	function _getUserSubscription (userId) {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
					console.log ("Some Problem with DB.");
				}
	           	deferred.reject (err);
	        } else {
	        	var query = "SELECT `subscribed_user_id`,`field_name` FROM `user_subscription` WHERE `user_subscription`.`user_id`=?";
	           	connection.query(mysql.format (query, [userId]), function (err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else {
	              		//reduces returned RowPackets array to above defined format
	              		rows = rows.reduce (function (acc, row) {
	              			//if (row ["field_name"] != "ALL") {
		              			if (!acc [row ["subscribed_user_id"]]) {
		              				acc [row ["subscribed_user_id"]] = {};
		              			}
		              			acc [row ["subscribed_user_id"]][row ["field_name"]] = 1;
	              			//}
	              			return acc;
	              		}, {});
	              		deferred.resolve (rows);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	exports.getUserSubscriptions = function (userId) {
		return _getUserSubscription (userId);
	}

	/**
	 * Gets all fields of all users. with each field either marked "1" (means user is subscribed to this field) OR "0" (means user is not subscribed to this field)
	 * @param  {Number} userId
	 * @return {Promise} resolves to :
	 * 					 {
	 * 					 	"user_id" : {
	 * 					 		username : <>,
	 * 					 		details : {
	 * 					 			"<user_field_name>" : <0  OR  1>,
	 * 					 			... 
	 * 					 		}
	 * 					 	},
	 * 					 	...
	 * 					 }
	 */
	exports.getAllUserWithSubscription = function (userId) {
		var deferred = q.defer ();
		//this function only resolves when all three private functins are resolved
		q.all ([_getAllUsers (), _getAllUserFields (), _getUserSubscription (userId)])
		.then (function (results) {

			var allUsers = results [0], // contains all users of database.
				allUserFields = results [1], // contains all fields of all users in database.
				userSubscription = results [2];//contains all fields of other user that current user is subscribed to.

			//mark all fields in @allUserFields as "1", to whom user user is subscribed to using entries in @userSubscription.
			Object.keys (userSubscription).forEach (function (curUserId) {
				Object.keys (userSubscription [curUserId]).forEach (function (curField) {
					if (!allUserFields [curUserId]) {
						allUserFields [curUserId] = {};
					}
					allUserFields [curUserId][curField] = 1;
				});
			});
			delete allUsers [userId];
			//add all fields of a user with marked subscription in @allUserFields to corresponding user in @allUsers.
			Object.keys (allUsers).forEach (function (key) {
				allUsers [key]["details"] = allUserFields [key] || {};
			});
			deferred.resolve (allUsers);
		}, function () {
			deferred.reject ("Oops! some error occured.");
		})/*.catch (function () {
			deferred.reject ("Oops! some error occured.");
		});*/
		return deferred.promise;
	}

	/**
	 * Private function to delete user's all subscription from database.
	 * @param  {Object} connection Database Connection
	 * @param  {Number} userId
	 * @param {Boolean} withTransaction tells whether this connection is using transaction.
	 * @return {Promise}
	 */
	function _deleteAllUserSubscription (connection, userId, withTransaction) {
		var deferred = q.defer ();
    	var query = "DELETE FROM `user_subscription` WHERE `user_id`=?";
  		connection.query(query, [userId],function(err, result) {
    		if (err) {
    			if (withTransaction) {
	      			connection.rollback(function() {
		        		return;
		      		});
      			}
	      		connection.release ();
  				return deferred.reject ();
	    	}
	    	deferred.resolve ();
	    });
	    return deferred.promise;
	}

	/**
	 * Private function to delete user's all subscription.
	 * @param  {Number} userId
	 * @return {Promise}
	 */
	function _deleteAllUserSubscription0 (userId) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
	        	_deleteAllUserSubscription (connection, userId, false)
	        	.then (function () {
	        		deferred.resolve ();
	        	}, function () {
	        		deferred.reject ();
	        	});
	        }
	    });
	    return deferred.promise;
	}

	/**
	 * Update user subscription by first deleting user's all previous subscriptions and then inserting new ones.
	 * Executed in transaction.
	 * @param  {Number} userId
	 * @param  {Object} subscription {
	 * 									"user_id" : [subscribed_field_name_1, ....],
	 * 									...
	 * 								 }
	 * @return {Promise}
	 */
	exports.updateUserSubscription = function (userId, subscription) {
		// if there are no new subscription to add,
		// then delete all and return
		if (Object.keys (subscription).length === 0) {
			return _deleteAllUserSubscription0 (userId);
		}
		var deferred = q.defer ();
		
		//current timeStamp to be added along with subscription
		var timeStamp = new Date ().getTime ();
		
		var queryParams = [];
		//preparing query parameters for Prepared SQL statement for inserting subscritpion in batch.
		/**
		 * [
		 * 		[user_id, subscribed_user_id, subscribed_field_name, cur_time_stamp],
		 * 		.....
		 * ]
		 */
		Object.keys (subscription).forEach (function (subscribedUserId) {
			var fieldsArray = subscription [subscribedUserId];
			fieldsArray.forEach (function (fieldName) {
				queryParams.push ([userId, subscribedUserId, fieldName, timeStamp]);
			});
		})

		pool.getConnection (function (err, connection) {
			if (err) {
	           	if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
	        	//Transaction begin
	        	connection.beginTransaction(function(err) {
			  		if (err) {
			  			connection.release ();
			  			return deferred.reject (); 
			  		}
			  		//first deletes all previous subscriptions.
			  		_deleteAllUserSubscription (connection, userId, true)
			  		.then (function () {
			  			//if deletion successfull
			  			// now inserting new subscriptions
			  			var query = "INSERT INTO `user_subscription` (`user_id`,`subscribed_user_id`,`field_name`,`created_date`) VALUES ?";
			  			connection.query(query, [queryParams],function(err, result) {
				    		if (err) {
				      			connection.rollback(function() {
					        		return;
					      		});
					      		connection.release ();
				  				return deferred.reject ();
					    	}
					    	// commit transaction, if both deletion and insertion operation are successful. 
					    	connection.commit(function(err) {
						        if (err) {
						          	connection.rollback(function() {
						        		return;
						      		});
						      		connection.release ();
					  				return deferred.reject ();
						        } else {
						        	connection.release ();
					  				return deferred.resolve ();
						        }
						    });
					    });
			  		}, function () {
			  			deferred.reject ();
			  		});
			  		
			  	});
	        }
		});
		return deferred.promise;
	}

	/**
	 * Adds new subscription 
	 * @param {Number} userId
	 * @param {Object} subscription {
	 * 									"user_id" : <subscribed_user_id>,
	 * 									"field_name" : <subscribed_field_name>
	 * 								}
	 */
	exports.addSubscription = function (userId, subscription) {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
				if (connection) {
					connection.release();
				}
	           	deferred.reject (err);
	        } else {
	        	var query = "INSERT INTO `user_subscription` (`user_id`,`subscribed_user_id`,`field_name`,`created_date`) VALUES (?,?,?,?)";
	        	var params = [userId, subscription.id, subscription.field_name, new Date ().getTime ()];
	           	connection.query( mysql.format (query, params), function (err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else {
	              		deferred.resolve ();
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	return exports;
}