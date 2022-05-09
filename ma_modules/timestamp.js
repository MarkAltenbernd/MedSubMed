var ts = function() {
	const now = new Date();
	const hours = now.getHours();
	let minutes = now.getMinutes();
	if (minutes < 10) {minutes = '0' + minutes;}
	let seconds = now.getSeconds();
	if (seconds < 10) {seconds = '0' + seconds;}
	let ms = now.getMilliseconds();
	if (ms < 10) {ms = '00' + ms}
	else if (ms < 100) {ms = '0' + ms} 
	const time = hours + ':' + minutes + ':' + seconds + '.' + ms;
	return time;
}
module.exports = ts;