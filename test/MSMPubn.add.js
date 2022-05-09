//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538, atMSMPublication } = require('./MSMDeployedAddresses.js');

const MSMFacade 	= artifacts.require("MSMFacade");
const MedSubMed 	= artifacts.require("MedSubMed");
const Util1538  	= artifacts.require("Util1538");
const UtilMSM	  	= artifacts.require("UtilMSM");
const MSMPublication  = artifacts.require("MSMPublication");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMPublication contract . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmPublication;

	try { 
		it(". . . instantiates 2 contract objects.", async () => {
			//	First concatenate their ABis to that of facade
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublication.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating Facade");
			
			//	Instantiate delegate contract that hosts delegated functions
			msmPublication = await MSMPublication.at(atMSMPublication, opts);
			assert.ok(msmPublication, "Failure instantiating msmPublication.");
			
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
		it(". . . adds delegate functions from the MSMPublication contract.", async () => {
//			REMEMBER: There must be no spaces between parameter types specifiers in multi-parametr signatures! 
			functionSignatures =  
				//	"msmPublicationIsActive(uint)" +
				  "addMSMPublication(string,string)"  		//   1
				+ "activateMSMPublication(uint256)" 		//   2
				+ "deactivateMSMPublication(uint256)" 		//   3
				+ "getMSMPublicationByKey(uint256)"			//   4
				+ "getMSMPublicationByIndex(uint256)" 		//   5
				+ "editMSMPublication(uint256,string,string,uint256,uint256,uint256,bool)"
				+ "getPubrPubnKeys(address)"				//   7
				+ "getMSMPublicationSubscriptions(uint256)"	//   8 	
				+ "getPubnPubrAddress(uint256)" 			//   9	
				+ "getPublicationCount()"					//  10
				+ "removeAllMSMPublications()"				//	11
				+ "getAllMSMPubnKeys()"						//  12
				+ "getActiveMSMPubnKeys()"					//  13
				;				
			const trnx = await msmFacade.updateContract(msmPublication.address, functionSignatures, "Functions have been added from the MSMPublication contract.", opts);
			assert.ok(trnx, "Failure adding MSMPublication functions to Facade.");
			const total = await msmFacade.totalFunctions.call(opts);
			assert.isAtLeast(Number(total), 10, "Failure calling totalFunctions().");
			ls("\n\t" + ts() + ": The MSMFacade contract now has " + total + " delegated functions.");	//*/
		});				
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});

	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});