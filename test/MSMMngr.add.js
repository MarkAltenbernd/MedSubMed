//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atMSMManager } = require('./MSMDeployedAddresses.js');

const MSMFacade 	= artifacts.require("MSMFacade");
const MedSubMed 	= artifacts.require("MedSubMed");
const Util1538  	= artifacts.require("Util1538");
const MSMManager    = artifacts.require("MSMManager");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMManager contract . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmManager;

	try { 
		it(". . . initiates.", () => { 
			ls("CONTRACT START:\t" + ts());
		});
		it(". . . has access to " + accounts.length + " accounts.", async () => {
			assert.ok(accounts.length > 0);
		});
		it(". . . instantiates 2 contract objects.", async () => {
			//	First concatenate their ABis to that of facade
			//	MedSubMed contains only the critical updateContract() function
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMManager.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts delegated functions
			msmManager = await MSMManager.at(atMSMManager, opts);
			assert.ok(msmManager, "MSMManager not ennewed()");
		});	
		
		it(". . . adds delegate functions from the MSMManager contract.", async () => {	
//			REMEMBER: There must be no spaces between parameter types in multi-parameter signatures! 
			functionSignatures =  
				//	"managerInArray(address)" 	Internal only, not a delegated function
				"addMSMManager(address)" +			//	 1
				"getMSMManagerCount()" + 			//	 2
				"getMSMManager(address)" +			//	 3
				"getActiveMSMManagers()" + 			//	 4
				"getAllMSMManagers()" +				//	 5 				
				"isManager(address)"	 			//   6
				;				
			const trnx = await msmFacade.updateContract(msmManager.address, functionSignatures, "Functions have been added from the MSMManager contract.", opts);
			assert.ok(trnx, "Failure adding MSMManager functions to the Facade.");
			const total = await msmFacade.totalFunctions.call(opts);
			assert.ok(total, "totalFunctions() not successfully executed.");
			ls("\n\t" + ts() + ": The MSMFacade contract now has " + total + " delegated functions.");	
		});				
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});

	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});