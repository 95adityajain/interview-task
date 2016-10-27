/**
 * This module some basic input validation helpers.
 */


var check = require ("check-types");

/**
 * @param  {Mixed} value vlaue to be validated.
 * @return {Boolean} false if value is null, undefined or not a string, otherwise false.
 */
module.exports.isValidString = function (value) {
	if (!check.assigned (value) || !check.string (value)) return false;
	return true;
}

/**
 * @param  {Mixed} value vlaue to be validated.
 * @return {Boolean} false if value is null, undefined or not a number, otherwise false.
 */
module.exports.isValidNumber = function (value) {
	if (!check.assigned (value) || !check.number (value)) return false;
	return true;
}

/**
 * @param  {Mixed} value vlaue to be validated.
 * @return {Boolean} false if value is null, undefined or not a object, otherwise false.
 */
module.exports.isValidObject = function (value) {
	if (!check.assigned (value) || !check.object (value)) return false;
	return true;
}

/**
 * @param  {Mixed} value vlaue to be validated.
 * @return {Boolean} false if value is null, undefined or not a array, otherwise false.
 */
module.exports.isValidArray = function (value) {
	if (!check.assigned (value) || !check.array (value)) return false;
	return true;
}