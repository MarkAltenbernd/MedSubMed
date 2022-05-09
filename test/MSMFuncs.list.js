//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538 } = require('./MSMDeployedAddresses.js');

const MSMFacade = artifacts.require("MSMFacade");
const Util1538  = artifacts.require("Util1538");
const UtilMSM = artifacts.require("UtilMSM");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMFacade contract . . .', async (accounts) => { 
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	let opts;
	opts = Object({from: DEFAULT_ACCOUNT});
	
	let msmFacade;
	let facadeIdentifier = "(Identity Unknown)"; 
	try {
		it(". . . has some delegated functions.", async () => { 
			ls("CONTRACT START:\t" + ts());
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			let funcIDMap = new Map(); 	
			
			const totalFunctions = await msmFacade.totalFunctions.call(opts); 
			assert.ok(totalFunctions > 0, "No functions are defined on MSMFacade"); //*/
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentifier = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}		
			ls("\n" + ts() + "\tThe MSMFacade " + facadeIdentifier + " has " + totalFunctions + " delegated functions defined,\n\t\tthe first of which will be omitted from the removal list");
			const funcSigs = await msmFacade.functionSignatures.call(opts);
			const sigArray = funcSigs.split(')');	//	Place each sig into its own array element
			if (sigArray.length > totalFunctions) {	//	Last element is empty . . .
				const lastGuy = sigArray.pop();		//	. . . added by .split() . . .
			}										//	. . . just discard
		//	Following so that updateContract() is NOT incldued in the removal list 
			const startFunc = 0; 	
			for (let i = startFunc; i < sigArray.length; i++) {
				const sig = sigArray[i].concat(')');	//	Put split-on character back in
				const sigHash = await msmFacade.signatureHash.call(sig, opts);
				const sigInt = Number(sigHash);
				const delAddr = await msmFacade.delegateAddress(sig, opts);
				funcIDMap.set(sigHash, sig);	
				//	We know they'er hex, so strip the suprfluous '0x' from the front
				const shortAddr = delAddr.toString().substring(2);
				const shortHash = sigHash.toString().substring(2); 
//
//##############################################################################				
//	You probably want just one of the following print statements to be in effect, 
//	with the rest commented out for a given run.
//				ls(shortAddr + " -- " + shortHash +  " = " + sig);	//	Delegates & sigs
				ls("\t" + (i) + ":\t" + shortAddr + " -- " + shortHash +  ": " + sig);	//	Delegates, hashes, & sigs
//				ls("\t" + (i) + ":\t" + shortHash +  " . . . " + sig);	//	Hashes, & sigs
//				ls(shortAddr + ": " + sig);	//	Delegates & sigs
//				ls('\t"' + sig +'" + ');	//	Removal list as a single string
//				ls(sig);					//	Sigs only, each on a separate line
			}
//*/			
//##############################################################################	
//
			ls("\n\tThe MSMFacade " + facadeIdentifier + " has " + totalFunctions + " delegated functions.");
			ls("CONTRACT END:\t" + ts());
		});
	}  catch (err) {
				ls('ERROR caught in TransparentContract tests:\n' + err);
	}
});