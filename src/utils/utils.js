/**
 * Helper Function to generate random strings based on supplied length.
 * 
 * @param {int} length 
 * Length of randomized String to return 
 */
const randomString = function (length) {
		var result           = '';
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < length; i++ ) {
		   result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
}

const initErrorHandler = function(cb) {
	[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
		process.on(eventType, cb.bind(null, eventType));
	});
}

/**
 * Module Exports
 */
module.exports = {
    randomString,
	initErrorHandler
}