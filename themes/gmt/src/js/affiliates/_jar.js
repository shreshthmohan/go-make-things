var jar = (function () {

	'use strict';

	// Setup the public methods object
	var publicAPIs = {};

	/**
	 * Create an expiration date timestamp
	 * @param  {Number} time How far into the future to expire the cookie
	 * @return {String}      The expiration timestamp
	 */
	var getExpirationDate = function (time) {
		return new Date(+new Date() + time).toUTCString();
	};

	/**
	 * Create a cookie
	 * @param {String} name        The name of the cookie
	 * @param {String} value       The value of the cookie
	 * @param {Number} expiration  How long to keep the cookie [optional]
	 */
	publicAPIs.set = function (name, value, expiration) {
		if (!name || !value) throw new Error('Please provide both aname and value for your cookie.');
		if (typeof value !== 'string') throw new Error('Cookie values can only be strings.');
		var expires = expiration ? ' expires=' + getExpirationDate(expires) : '';
		document.cookie = name + '=' + value + ';' + expires;
	};

	/**
	 * Get the value of a cookie
	 * Source: https://gist.github.com/wpsmith/6cf23551dd140fb72ae7
	 * @param  {String} name  The name of the cookie
	 * @return {String}       The cookie value
	 */
	publicAPIs.get = function (name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2) return parts.pop().split(";").shift();
	};

	// /**
	//  * Delete a cookie
	//  * @param  {String} name  The name of the cookie
	//  */
	// publicAPIs.remove = function (name) {
	// 	document.cookie = name + '=null; expires=' + getExpirationDate(-1);
	// };

	// Return the constructor
	return publicAPIs;

})();