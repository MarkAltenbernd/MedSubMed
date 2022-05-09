//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538, atMSMPublisher, atMSMSubscription, atMSMSubscriptUtils } = require('./MSMDeployedAddresses.js');

const MSMFacade 		= artifacts.require("MSMFacade");
const MedSubMed 		= artifacts.require("MedSubMed");
const Util1538  		= artifacts.require("Util1538");
const UtilMSM  			= artifacts.require("UtilMSM");
//const MSMSubscription	= artifacts.require("MSMSubscription");
const MSMSubscriptUtils = artifacts.require("MSMSubscriptUtils");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMSubscriptUtils contract . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmSubscriptUtils;
	let facadeIdentity = "(Identity Unknown)";

	try { 
		it(". . . initiates.", async () => { 
			ls("CONTRACT START:\t" + ts());
			//	First concatenate their ABis to that of facade
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriptUtils.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts delegated functions
			msmSubscriptUtils = await MSMSubscriptUtils.at(atMSMSubscriptUtils, opts);
			assert.ok(msmSubscriptUtils, "MSMSubscriptUtils not ennewed()");
			
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("CONTRACT START:\t" + ts());
			ls("FACADE IDENTITY: " + facadeIdentity);
		});	
		
		it(". . . adds delegate functions from the MSMSubscriptUtils contract.", async () => {	
//			REMEMBER: There must be no spaces between parameter types! 
			functionSignatures =  
				  "getSubscriptionCount()"										//  1
				+ "getPubnSubnCount(uint256)"									//  2
				+ "getPubrSubnCount(address)"									//  3
				+ "getSubrSubnCount(address)"									//  4
				+ "getAllMSMSubscriptions()"									//  5
				+ "getActiveMSMSubscriptions()"	 								//  6
				+ "getAllMSMSubnKeys()"											//  7
				+ "getActiveMSMSubnKeys()"										//  8
				+ "getMSMSubscriptionByIndex(uint256)" 							//  9
				+ "getMSMSubscriptionByKey(uint256)"							// 10
				;				
			const trnx = await msmFacade.updateContract(msmSubscriptUtils.address, functionSignatures, "Functions have been added from the MSMSubscriptUtils contract.", opts);
			assert.ok(trnx, "Failure adding MSMSubscriptUtils functions to the Facade.");
			const total = await msmFacade.totalFunctions.call(opts);
			assert.ok(total, "totalFunctions() not successfully executed.");
			ls("\n\t" + ts() + ": The MSMFacade " + facadeIdentity + " now has " + total + " delegated functions.");	//*/
		});				
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});

	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});