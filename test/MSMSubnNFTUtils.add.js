
//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538, atMSMPublisher, atMSMSubscription, atMSMSubnNFTUtils } = require('./MSMDeployedAddresses.js');

const MSMFacade 			= artifacts.require("MSMFacade");
const MedSubMed 			= artifacts.require("MedSubMed");
const Util1538  			= artifacts.require("Util1538");
const UtilMSM  				= artifacts.require("UtilMSM");
const MSMSubnNFTUtils 		= artifacts.require("MSMSubnNFTUtils");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMSubnNFTUtils contract . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmSubnNFTUtils;
	let facadeIdentity = "(Identity Unknown)";

	try { 
		it(". . . initiates.", async () => { 
			ls("CONTRACT START:\t" + ts());
			//	First concatenate their ABis to that of facade
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubnNFTUtils.abi);
			
			//	Instantiate the facade to which delegated functions will be added
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
			
			//	Instantiate delegate contract that hosts delegated functions
			msmSubnNFTUtils = await MSMSubnNFTUtils.at(atMSMSubnNFTUtils, opts);
			assert.ok(msmSubnNFTUtils, "msmSubnNFTUtils not ennewed()");
			
			const funcSig = "getFacadeIdentifiers()";	//	Delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("CONTRACT START:\t" + ts());
			ls("FACADE IDENTITY: " + facadeIdentity);
		});	
		
		it(". . . adds delegate functions from the MSMSubnNFTUtils contract.", async () => {	
			functionSignatures =  
				  "getMSMSubnNFTAddr(uint256)"									//  1
				+ "getMSMSubnNFT(uint256)"										//	2
				+ "getMSMSubnNFTProps(uint256)"									//  3
				+ "getMSMSubnNFTCount()"										//  4
				+ "getSubnNFTKeys()"											//	5
				;				
			const trnx = await msmFacade.updateContract(msmSubnNFTUtils.address, functionSignatures, "Functions have been added from the MSMSubnNFTUtils contract.", opts);
			assert.ok(trnx, "Failure adding MSMSubnNFTUtils functions to the Facade.");
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