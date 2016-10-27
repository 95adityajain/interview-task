/**
 * This module contains functions related to `user_fields` (User Details) database operations.
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

	//required dependencies
	var addNotificationHandler = require ('./notifications')(mysql, pool)["addNotification"];
	var NOTIFICATION_VERBS = require ('../../utility/constants/notificationVerbs');


	/**
	 * Get all user's details (fields)
	 * @param  {Number} userId
	 * @return {Promise} resolves to array of details (fields) of form : 
	 * 					 [
	 * 					 	{
	 * 					 		field_name : <user_field_name>,
	 * 					 		field_value : <user_field_value>
	 * 					 	},
	 * 					 	....
	 * 					 ]
	 */
	exports.getDetails = function (userId) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	deferred.reject (err);
	        } else {
	        	sqlQuery = mysql.format("SELECT `field_name`, `field_value` FROM `user_fields` WHERE `user_id`=?", [userId]);
	           	connection.query(sqlQuery,function(err, rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else if (rows.length > 0) {
	              		deferred.resolve (rows);
	              	} else {
	              		deferred.resolve ([]);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	/**
	 * Tell whether provided detail exists for corresponding user. 
	 * @param  {Number} userId
	 * @param  {String} detailName
	 * @return {Promise}
	 */
	function _isDetailsExists (userId, detailName) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	deferred.reject (0);
	        } else {
	        	sqlQuery = mysql.format("SELECT `field_name` FROM `user_fields` WHERE `user_id`=? AND `field_name`=?", [userId, detailName]);
	           	connection.query(sqlQuery,function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (0);
	              	} else if (rows.length > 0) {
	              		deferred.resolve ();
	              	} else {
	              		deferred.reject (1);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}


	/**
	 * Private function to get all user who have subscribe to everything of this user. 
	 * @param  {Number} userId
	 * @param  {Object} connection Database connection
	 * @param  {Boolean} withTransaction tells whether this connection is using transaction.
	 * @return {Promise} resolves to array of userId.
	 * 					 [user_id_1, ....]
	 */
	function _getUsersWithALLFieldTo (userId, connection, withTransaction) {
		var deferred = q.defer ();
    	sqlQuery = mysql.format("SELECT `user_id` FROM `user_subscription` WHERE `subscribed_user_id` = ? AND `field_name`=?", [userId, "ALL"]);
       	connection.query(sqlQuery,function(err, rows) {
    		if (err) {
    			if (withTransaction) {
	      			connection.rollback(function() {
		        		return;
		      		});
      			}
	      		connection.release ();
  				return deferred.reject ();
	    	}
	    	rows = rows.reduce (function (acc, row) {
	    		acc.push (row.user_id);
	    		return acc;
	    	}, []);
	    	deferred.resolve (rows);
	    });
		return deferred.promise;
	}

	/**
	 * Private function that adds subscription to all user's which have subscribe to everything of this user. (so they can receive future notifcation of the new detail added).
	 * @param {Number} subscribedUserId 
	 * @param {String} fieldName
	 * @param {Object} connection 
	 * @return {Promise}
	 */
	function _addSubscriptionHelper (subscribedUserId, fieldName, connection) {
		var deferred = q.defer ();
		_getUsersWithALLFieldTo (subscribedUserId, connection, true)
		.then (function (userArray) {
			if (userArray.length === 0) {
				return deferred.resolve ();
			}
			var timeStamp = new Date ().getTime ();
			var queryParams = [];
			
			userArray.forEach (function (userId) {
				queryParams.push ([userId, subscribedUserId, fieldName, timeStamp]);
			});
			var query = "INSERT INTO `user_subscription` (`user_id`,`subscribed_user_id`,`field_name`,`created_date`) VALUES ?";
			connection.query(query, [queryParams],function(err, result) {
	    		if (err) {
	      			connection.rollback(function() {
		        		return;
		      		});
		      		connection.release ();
	  				return deferred.reject ();
		    	}
		    	deferred.resolve ();
		    });
		}, function () {
			deferred.reject ();
		});
		return deferred.promise;
	}

	/**
	 * Private function that adds new detail for particular user.
	 * @param {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @param {Object} connection Database connection.							
	 * @return {Promise}
	 */
	function _addDetails0 (userId, details, connection) {
		var deferred = q.defer ();
    	sqlQuery = mysql.format("INSERT INTO `user_fields` (`user_id`, `field_name`, `field_value`) VALUES (?, ?, ?)", [userId, details.field_name, details.field_value]);
       	connection.query(sqlQuery,function(err, result) {
    		if (err) {
      			connection.rollback(function() {
	        		return;
	      		});
	      		connection.release ();
  				return deferred.reject ();
	    	}
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
		return deferred.promise;
	}

	/**
	 * Private function that adds new detail for particular user and creates notifcation for action performed.
	 * Also creates a subscription entry for those users, who have subscribe to everything of this user,so that it can receive future notifications corresponding to new field added. 
	 * Executes in transaction.
	 * @param {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @return {Promise} resolves to notificationObject.
	 */
	function _addDetails (userId, details/*Object*/) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	return deferred.reject (err);
	        }
        	connection.beginTransaction(function(err) {
		  		if (err) {
		  			connection.release ();
		  			return deferred.reject (); 
		  		}
		  		_addSubscriptionHelper (userId, details.field_name, connection)
		  		.then (function () {
		  			addNotificationHandler (connection, true, NOTIFICATION_VERBS.ADDED, userId, details.field_name, details.field_value)
		        	.then (function (notificationObject) {
		        		_addDetails0 (userId, details, connection)
		        		.then (function () {
		        			deferred.resolve (notificationObject);
			        	}, function () {
			        		deferred.reject ();
			        	});
		        	}, function () {
		        		deferred.reject ();
		        	});
		  		}, function () {
		  			deferred.reject ();
		  		});
            });
		});
		return deferred.promise;
	}

	/**
	 * Add new detail for particular user, if it doesn't already exists in database.
	 * @param {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @return {Promise} resolves to notificationObject.
	 */
	exports.addDetails = function (userId, details) {
		var deferred = q.defer ();
		_isDetailsExists (userId, details.field_name)
		.then (function () {
			deferred.reject ("This Detail already exists.");
		},function (errorStatus) {
			if (errorStatus === 0) {
				deferred.reject ("Oops! some error occured!");
			} else {
				_addDetails (userId, details)
				.then (function (notificationObject) {
					deferred.resolve (notificationObject);
				}, function () {
					deferred.reject ("Oops! some error occured!");
				})
			}
		})
		return deferred.promise;
	}


	/**
	 * Private function that updates detail for particular user.
	 * @param {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @param {Object} connection Database connection.							
	 * @return {Promise}
	 */
	function _updateDetails0 (userId, details, connection) {
		var deferred = q.defer ();
    	sqlQuery = mysql.format("UPDATE `user_fields` SET `field_value`=? WHERE `user_id`=? AND `field_name`=?", [details.field_value, userId, details.field_name]);
       	connection.query(sqlQuery,function(err,rows){
    		if (err) {
      			connection.rollback(function() {
	        		return;
	      		});
	      		connection.release ();
  				return deferred.reject ();
	    	}
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
		return deferred.promise;
	}


	/**
	 * Private function that updates particular user details and creates notification for perfomed action.
	 * @param  {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @return {Promise} resolves to notificationObject.
	 */
	function _updateDetails (userId, details) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	return deferred.reject (err);
	        }
        	connection.beginTransaction(function(err) {
		  		if (err) {
		  			connection.release ();
		  			return deferred.reject (); 
		  		}
	        	addNotificationHandler (connection, true, NOTIFICATION_VERBS.UPDATED, userId, details.field_name, details.field_value)
	        	.then (function (notificationObject) {
	        		_updateDetails0 (userId, details, connection)
	        		.then (function () {
	        			deferred.resolve (notificationObject);
		        	}, function () {
		        		deferred.reject ();
		        	});
	        	}, function () {
	        		deferred.reject ();
	        	});
            });
		});
		return deferred.promise;
	}

	/**
	 * Update particular user details, if details exists in database
	 * @param  {Number} userId
	 * @param  {Object} details object of form : 
	 * 							{
	 * 								"field_name" : <user_field_name>,
	 * 								"field_value" : <value>
	 * 							}
	 * @return {Promise} resolves to notificationObject.
	 */
	exports.updateDetails = function (userId, details/*Object*/) {
		var deferred = q.defer ();
		_isDetailsExists (userId, details.field_name)
		.then (function () {
			_updateDetails (userId, details)
			.then (function (notificationObject) {
				deferred.resolve (notificationObject);
			}, function () {
				deferred.reject ("Oops! some error occured!");
			})
		},function () {
			deferred.reject ("Oops! some error occured!");
		})
		return deferred.promise;
	}

	/**
	 * Private function that deletes detail for particular user.
	 * @param {Number} userId
	  * @param  {String} detailName
	 * @param {Object} connection Database connection.							
	 * @return {Promise}
	 */
	function _deleteDetails0 (userId, detailName, connection) {
		var deferred = q.defer ();
    	sqlQuery = mysql.format("DELETE FROM `user_fields` WHERE `user_id`=? AND `field_name`=?", [userId, detailName]);
       	connection.query(sqlQuery,function(err,rows){
    		if (err) {
      			connection.rollback(function() {
	        		return;
	      		});
	      		connection.release ();
  				return deferred.reject ();
	    	}
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
		return deferred.promise;
	}

	/**
	 * Private function to delete particular detail of user and create notification for performed action.
	 * Executes in transaction.
	 * @param  {Number} userId
	 * @param  {String} detailName
	 * @return {Promise} resolves to notificationObject.
	 */
	function _deleteDetails (userId, detailName) {
		var deferred = q.defer ();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	return deferred.reject (err);
	        }
        	connection.beginTransaction(function(err) {
		  		if (err) {
		  			connection.release ();
		  			return deferred.reject (); 
		  		}
	        	addNotificationHandler (connection, true, NOTIFICATION_VERBS.DELETED, userId, detailName, "")
	        	.then (function (notificationObject) {
	        		_deleteDetails0 (userId, detailName, connection)
	        		.then (function () {
	        			deferred.resolve (notificationObject);
		        	}, function () {
		        		deferred.reject ();
		        	});
	        	}, function () {
	        		deferred.reject ();
	        	});
            });
		});
		return deferred.promise;
	}

	/**
	 * Delete detail if detail exists in database for corresponding user.
	 * @param  {Number} userId
	 * @param  {String} detailName
	 * @return {Promise} resolves to notificationObject.
	 */
	exports.deleteDetails = function (userId, detailName) {
		var deferred = q.defer ();
		_isDetailsExists (userId, detailName)
		.then (function () {
			_deleteDetails (userId, detailName)
			.then (function (notificationObject) {
				deferred.resolve (notificationObject);
			}, function () {
				deferred.reject ("Oops! some error occured!");
			})
		},function () {
			deferred.reject ("Oops! some error occured!");
		})
		return deferred.promise;
	}

	return exports;
}