//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538 } = require('./MSMDeployedAddresses.js');

const MSMFacade = artifacts.require("MSMFacade");
const MedSubMed = artifacts.require("MedSubMed");
const Util1538  = artifacts.require("Util1538");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMFacade Contract . . .', async (accounts) => { 
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, util1538;

	try { 
		it(". . . initiates.", () => { 
			ls("CONTRACT START:\t" + ts());
		});
		it(". . . has access to " + accounts.length + " accounts.", async () => {
			assert.ok(accounts.length > 0);
		});
		it(". . . instantiates 2 delegate contract objects.", async () => {
			//	First concatenate the ABIs of the contracts whose 			
			//	functions will be delegated to the facade.
			//	MedSubMed contains only the critical updateContract() function
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			//	Util1538 contains functions that query the ERC-1538 state variables
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts functions to be delegated
			util1538 = await Util1538.at(atUtil1538, opts);
			assert.ok(util1538, "Util1538 not ennewed()");
		});	
		
		it(". . . adds delegated functions from the Util1538 contract.", async () => {	
			//	Already present, added by facade's constructor: 
			//	"updateContract(address,string,string)"	//	 0
			functionSignatures = 	
				  "totalFunctions()"					//	 1
				+ "functionByIndex(uint256)"			//	 2
				+ "functionExists(string)"				//	 3
				+ "functionSignatures()"				//	 4
				+ "delegateFunctionSignatures(address)"	//	 5
				+ "delegateAddress(string)" 			//	 6	
				+ "functionById(bytes4)" 				//	 7
				+ "delegateAddresses()"  				//	 8
				+ "signatureHash(string)" 				//	 9
				+ "signatureHashes()"  					//	10 
				;
				
			const trnObj = await msmFacade.updateContract(util1538.address, functionSignatures, "Functions have been added from the Util1538 contract.", opts);
			assert.ok(trnObj, "Failure updating Facade with Util1538 functions.");	
		});	//*/	
		it(". . . retrieves a count of delegated functions.", async () => {		
			const total = await msmFacade.totalFunctions.call(opts);
			assert.ok(total, "Failure calling totalFunctions().");
			ls("\n\t" + ts() + ": " + total + " Util1538 functions have been added.");
		});
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});