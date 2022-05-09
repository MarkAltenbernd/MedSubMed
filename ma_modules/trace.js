function ls(mssg) {
	console.log(mssg);
}
module.exports = ls;

//	In a JavaScript file, 'require' it . . .
//	const ls = require('../ma_modules/trace');
 
 //	. . . then use it thus:
 //	ls('\n\tThis is a message logged to the console via ls()');