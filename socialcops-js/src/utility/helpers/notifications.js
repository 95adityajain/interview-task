/**
 * This module contains functions related to user's `notification` database operations.
 */




var q = require ("q");

/**
 * Wrapper function that allow access to MYSQL package and Database Connection Pool to every function.	
 * @param  {Object} mysql
 * @param  {Object} pool  
 * @return {Object} containing all helper methods to be exported.
 */
module.exports = function (mysql, pool) {

	var getUserSubscriptions = require ('./subscriptions') (mysql, pool)["getUserSubscriptions"];
	
	var exports = {};

	/**
	 * Add new notification corresponding to user action.
	 * @param {Object} connection Database Connection
	 * @param {Boolean} withTransaction tells whether this connection is using transaction. 
	 * @param {String} verb Type of notification. ("added", "updated", "deleted").
	 * @param {Number} actor_id user_id of actor of notification.
	 * @param {String} fieldName field_name to which notification is corresponding to.
	 * @param {String} fieldValue new value of field to which notificatiomn is corresponding to.
	 * @return {Promise} resolves when notification is added in database and resolves to notification object of form : 
	 * 					 {
	 * 					 	id : <unique notification identifier>,
	 * 					 	verb : <type of notification>,
	 * 					 	actor_id : <user_id whose action caused notification>,
	 * 					 	field_name : <actor_field_name>,
	 * 					 	field_value : <new_actor_field_value>,
	 * 					 	created_date : <timestamp at which notification was created>
	 * 					 }
	 */
	exports.addNotification = function (connection, withTransaction, verb, actorId, fieldName, fieldValue) {
		var deferred = q.defer ();
    	var timeStamp = new Date ().getTime ();
    	sqlQuery = mysql.format("INSERT INTO `notification_info` (`verb`, `actor_id`, `field_name`, `field_value`, `created_date`) VALUES (?, ?, ?, ?, ?)", [verb, actorId, fieldName, fieldValue, timeStamp]);
       	connection.query(sqlQuery,function(err, result) {
    		if (err) {
    			if (withTransaction) {
	      			connection.rollback(function() {
		        		return;
		      		});
      			}
	      		connection.release ();
  				return deferred.reject ();
	    	}
	    	var notificationObject = {
	    		id : result.insertId,
	    		verb : verb,
	    		actor_id : actorId,
	    		field_name : fieldName,
	    		field_value : fieldValue,
	    		created_date : ""+timeStamp
	    	};
	    	deferred.resolve (notificationObject);
	    });
		return deferred.promise;
	}

	function _getUserNotifications0 (subscribedUserId, fieldsArray) {
		var deferred = q.defer();
		pool.getConnection (function (err, connection) {
			if (err) {
	           	connection.release();
	           	deferred.reject (err);
	        } else {
	        	var questionMarks = fieldsArray.map (function () {
	        		return "?";
	        	}).join (", ");
	        	var query = "SELECT * FROM `notification_info` WHERE `actor_id`=? AND `field_name` IN ("+ questionMarks +")";
        		var params = [subscribedUserId];
	        	fieldsArray.forEach (function (field) {
	        		params.push (field);
	        	});
	        	var sqlQuery = mysql.format(query, params);
	           	connection.query(sqlQuery,function(err,rows){
	            	connection.release();
	              	if (err) {
	              		deferred.reject (err);
	              	} else {
	              		deferred.resolve (rows);
	              	}
	           });
	        }
		});
		return deferred.promise;
	}

	function _getUserNotifications (subscriptions) {
		var deferred = q.defer ();
		var promiseArray = [];
		for (var subscribedUserId in subscriptions) {
			promiseArray.push (_getUserNotifications0 (subscribedUserId, Object.keys (subscriptions [subscribedUserId])));
		}
		q.all (promiseArray)
		.then (function (results) {
			var notifications = [];

			results.forEach (function (result) {
				result.forEach (function (notification) {
					notifications.push (notification);
				});
			});
			deferred.resolve (notifications);
		}, function () {
			deferred.reject ("Oops some error occurred.");
		});

		return deferred.promise;
	}

	/**
	 * Get User all notification corresponding to user subscriptions.
	 * @param  {Number} userId
	 * @return {Promise} resolves to array of notifications object : 
	 * 					 [
	 * 					 	notification_object_1,
	 * 					 	....
	 * 					 ]
	 * 							
	 */
	exports.getUserNotifications = function (userId) {
		var deferred = q.defer ();
		// get user subscription
		getUserSubscriptions (userId)
		.then (function (subscriptions) {
			//get all notification corresponding to all subscriptions.
			_getUserNotifications (subscriptions)
			.then (function (notifications) {
				deferred.resolve (notifications);
			}, function () {
				deferred.reject ("Oops! some error occurred.");
			});
		}, function () {
			deferred.reject ("Oops! some error occurred.");
		});
		return deferred.promise;
	}


	return exports;
}