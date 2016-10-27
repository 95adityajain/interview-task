/**
 * This module handles all WebSockets events.
 */

module.exports = function (mysql, pool) {
	var getUserNotifications = require ('../utility/helpers/notifications')(mysql, pool) ["getUserNotifications"];
	var addSubscription = require ('../utility/helpers/subscriptions')(mysql, pool) ["addSubscription"];
	return function (socket) {
		console.log ("client connected.");

	    socket.on ("send:allNotifications", function (userId) {
	        getUserNotifications (userId)
			.then (function (notifications) {
				socket.emit ("receive:allNotifications", notifications);
			});
	    });

	    socket.on ("add:subscription", function (data) {
	    	addSubscription (data.user_id, data.subscription);
	    });

		socket.on ('disconnect', function () {
			console.log ("client disconnected.");
		});
	}
}