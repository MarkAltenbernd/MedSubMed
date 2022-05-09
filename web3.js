import Web3 from 'web3';

//Remove following statement b/c it won't work on Next server . . .
//	const web3 = new Web3(window.web3.currentProvider);
//	. . . use the following instead.
let web3;
if ((typeof window !== 'undefined') &&		// Running in a browser . . .
	(typeof window.web3 !== 'undefined')) { // . . . with a Web3 injector . . . 
		web3 = new Web3(window.web3.currentProvider);	// . . . e.g. MetaMask
} else {	//	-Either- we are on the Next server 
			//	-Or- browser has no Web3 injector
	const provider = new Web3.providers.HttpProvider(process.env.RINKEBY_URL);
	web3 = new Web3(provider);
}
export default web3;