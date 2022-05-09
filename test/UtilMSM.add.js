//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtilMSM } = require('./MSMDeployedAddresses.js');

const MSMFacade = artifacts.require("MSMFacade");
const MedSubMed = artifacts.require("MedSubMed");
const Util1538   = artifacts.require("Util1538");
const UtilMSM   = artifacts.require("UtilMSM");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The UtilMSM Contract . . .', async (accounts) => { 
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade,  utilMSM;

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
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts delegated functions
			utilMSM = await UtilMSM.at(atUtilMSM, opts);
			assert.ok(utilMSM, "UtilMSM not ennewed()");
		});	
		it(". . . adds delegate functions from the UtilMSM contract.", async () => {	
			const count = await msmFacade.totalFunctions.call(opts);
			ls("\n\t" + ts() + ": The contract begins with " + count + " functions . . . "); 
//			REMEMBER: There must be no spaces between parameter types! 
			functionSignatures = 	
				  "getMsgSender()" 					//	 1
				+ "getTxOrigin()"					//	 2
				+ "getMsgData()"					//	 3
				+ "getMSMOwner()" 					//	 4
				+ "getMSMVersion()" 				//	 5
				+ "getMSMTitle()"					//	 6
				+ "getMSMDescription()"	 			//	 7
				+ "isOwner(address)"				//	 8
				+ "getFactoryID()"					//	 9 
				+ "getFacadeSequenceNumber()"		//  10
				+ "getFacadeIdentifiers()"			//	11
				;						
			const trnObj = await msmFacade.updateContract(utilMSM.address, functionSignatures, " functions have been added from the UtilMSM contract.", opts);
			assert.ok(trnObj, "UtilMSM behavior NOT added");
		});
		it (". . . it retrieves the updated count of delegated functions on the facade.", async () => {
			const total = await msmFacade.totalFunctions.call(opts);
			assert.ok(total, "totalFunctions() not successfully executed.");
			ls("\n\t" + ts() + "The MSMFacade contract now has " + total + " delegated functions.");
		});	//*/			
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});