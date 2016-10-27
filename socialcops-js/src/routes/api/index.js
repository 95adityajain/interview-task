/**
 * This module acts as a sub-app handling all routes of type "/api/*".
 * Returns responses in form of : {
 * 									  "status" : <"success"  OR  "error">,
 * 									  <some_optional_data_or_message_name> : <some_optinal_data_or_message_value>
 * 							 	  }
 */



/**
 * Wrapper function that allow access to MYSQL package, Database Connection Pool and WebSocket to every route function.	
 * @param  {Object} mysql
 * @param  {Object} pool  
 * @param {Object} io webSocket object.
 * @return {Object} containing all helper methods to be exported.
 */
module.exports = function (mysql, pool, io) {

	//All required dependencies.
	var express = require ('express');
	var router = express.Router();
	var validate = require ('../../utility/inputValidation');
	var userHelper = require ('../../utility/helpers/user')(mysql, pool);
	var subscriptionHelper = require ('../../utility/helpers/subscriptions')(mysql, pool);
	var detailsHelper = require ('../../utility/helpers/details')(mysql, pool);
	var notificationHelper = require ('../../utility/helpers/notifications')(mysql, pool);

	/**
	 * @request_body {Object} of form :
	 * 						  {
	 * 						  	"username" : <value>,
	 * 						  	"password" : <value>
	 * 						  }
	 */
	router.post ("/register", function (req, res) {
		var username = req.body.username.trim ();
		var password = req.body.password.trim ();
		if (!validate.isValidString (username) || !validate.isValidString (password)) {
			res.status (500).json ({status : "error", message : "Input Not Correct."});
		} else {
			userHelper.registerUser (username, password)
			.then (function (user) {
				res.json ({status : "success", message : "You are successfully registered"});
				io.emit ("add:newUser", user);
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * @request_body {Object} of form :
	 * 						  {
	 * 						  	"username" : <value>,
	 * 						  	"password" : <value>
	 * 						  }
	 */
	router.post ("/login", function (req, res) {
		var username = req.body.username.trim ();
		var password = req.body.password.trim ();
		if (!validate.isValidString (username) || !validate.isValidString (password)) {
			res.status (500).json ({status : "error", message : "Input Not Correct."});
		} else {
			userHelper.login (username, password)
			.then (function (val) {
				res.json ({status : "success", user : val});
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * @params {Number} id corresponds to userId
	 */
	router.get ("/details/:id", function (req, res) {
		var userId = parseInt (req.params.id);
		if (!validate.isValidNumber (userId) ) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			detailsHelper.getDetails (userId)
			.then (function (details) {
				res.json ({status : "success", details : details});
			}, function () {
				res.json ({status : "error", message : "Some error occurred while getting details."});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * Emit "notification" event on web-sockets, if request is successful, so other connected users can receive updates in real-time.
	 * @request_body {Object} of form :
	 * 						  {
	 * 						  	"user_id" : <value>,
	 * 						  	"details" : {
	 * 						  					"field_name" : <>,
	 * 						  					"field_value" : <>
	 * 						  				}
	 * 						  }
	 */
	router.post ("/details", function (req, res) {
		var userId = req.body.user_id;
		var detail = req.body.detail;
		if (!validate.isValidNumber (userId) || !validate.isValidObject (detail)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			detailsHelper.updateDetails (userId, detail)
			.then (function (notificationObject) {
				res.json ({status : "success", message : "Detail updated successfully."});
				io.emit ("notification", notificationObject);
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * Emit "notification" event on web-sockets, if request is successful, so other connected users can receive updates in real-time.
	 * @request_body {Object} of form :
	 * 						  {
	 * 						  	"user_id" : <value>,
	 * 						  	"details" : {
	 * 						  					"field_name" : <>,
	 * 						  					"field_value" : <>
	 * 						  				}
	 * 						  }
	 */
	router.put ("/details", function (req, res) {
		var userId = req.body.user_id;
		var detail = req.body.detail;
		if (!validate.isValidNumber (userId) || !validate.isValidObject (detail) || !validate.isValidString (detail.field_name)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			detailsHelper.addDetails (userId, detail)
			.then (function (notificationObject) {
				res.json ({status : "success",message : "Detail added successfully."});
				io.emit ("notification", notificationObject);
				io.emit ("add:newUserField", userId);
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * Emit "notification" event on web-sockets, if request is successful, so other connected users can receive updates in real-time.
	 * @params {Number} id corresponds to userId
	 * @params {String} fieldName name of field to be deleted
	 */
	router.delete ("/details/:id/:field_name", function (req, res) {
		var userId = parseInt (req.params.id);
		var fieldName = req.params.field_name;
		if (!validate.isValidNumber (userId) || !validate.isValidString (fieldName)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			detailsHelper.deleteDetails (userId, fieldName)
			.then (function (notificationObject) {
				res.json ({status : "success", message : "Detail deleted successfully."});
				io.emit ("notification", notificationObject);
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * @params {Number} id corresponds to userId
	 */
	router.get ("/subscriptions/:id", function (req, res) {
		var userId = parseInt (req.params.id);
		if (!validate.isValidNumber (userId)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			subscriptionHelper.getAllUserWithSubscription (userId)
			.then (function (subscriptions) {
				res.json ({status : "success", subscriptions : subscriptions});
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * @params {Number} id corresponds to userId
	 * @request_body of form :{
	 * 							  "subscriptions" : {
	 * 							  						"user_id" : [field_name_1, ....],
	 * 							  						....
	 * 							  					}
	 * 						  } 
	 */
	router.post ("/subscriptions/:id", function (req, res) {
		var userId = parseInt (req.params.id);
		var subscriptions = req.body.subscriptions;

		if (!validate.isValidNumber (userId) ||!validate.isValidObject (subscriptions)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			subscriptionHelper.updateUserSubscription (userId, subscriptions)
			.then (function () {
				res.json ({status : "success"});
			}, function (errorMsg) {
				res.json ({status : "error", message : "Oops! some error occurred."});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	/**
	 * @params {Number} id corresponds to userId
	 */
	router.get ("/notifications/:id", function (req, res) {
		var userId = parseInt (req.params.id);
		if (!validate.isValidNumber (userId)) {
			res.status (400).json ({status : "error", message : "Bad Request"});
		} else {
			notificationHelper.getUserNotifications (userId)
			.then (function (notifications) {
				res.json ({status : "success", notifications : notifications});
			}, function (errorMsg) {
				res.json ({status : "error", message : errorMsg});
			})
			.catch (function (ex) {
				res.json ({status : "error", message : "Something went wrong."});
			});
		}
	});

	return router;
}