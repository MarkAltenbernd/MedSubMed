//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atMSMPublisher } = require('./MSMDeployedAddresses.js');

const MSMFacade 	= artifacts.require("MSMFacade");
const MedSubMed 	= artifacts.require("MedSubMed");
const Util1538  	= artifacts.require("Util1538");
const UtilMSM		= artifacts.require("UtilMSM");
const MSMAdminUtils = artifacts.require("MSMAdminUtils");	
const MSMPublisher  = artifacts.require("MSMPublisher");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMPublisher contract . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmPublisher;

	try {
		it(". . . initiates.", async () => {
			//	First concatenate their ABis to that of facade
			//	MedSubMed contains only the critical updateContract() function
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublisher.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts delegated functions
			msmPublisher = await MSMPublisher.at(atMSMPublisher, opts);
			assert.ok(msmPublisher, "MSMPublisher not ennewed()");
			
			ls("CONTRACT START:\t" + ts());
 			let facadeIdentity = "(Identity Unknown)";
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("FACADE IDENTITY: " + facadeIdentity);
		});			
		it(". . . adds delegate functions from the MSMPublisher contract.", async () => {	
//			REMEMBER: There must be no spaces between parameter types! 
			functionSignatures =  
				  "addMSMPublisher(address,string)"		//  1
				+ "activateMSMPublisher(address)" 		//  2
				+ "getMSMPublisherCount()" 				//  3
				+ "getMSMPublisher(address)" 			//  4
				+ "getMSMPublisherNames()" 				//  5
				+ "getActiveMSMPublishers()" 			//  6
				+ "getAllMSMPubrAddrs()"				//  7
				+ "getActiveMSMPubrAddrs()"				//  8
				;				
			const trnx = await msmFacade.updateContract(msmPublisher.address, functionSignatures, "Functions have been added from the MSMPublisher contract.", opts);
			assert.ok(trnx, "Failure adding MSMPublisher functions to the Facade.");
			const total = await msmFacade.totalFunctions.call(opts);
			assert.ok(total, "totalFunctions() not successfully executed.");
			ls("\n\t" + ts() + ": The MSMFacade contract now has " + total + " delegated functions.");	
			ls("CONTRACT END:\t" + ts());
		});	
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});