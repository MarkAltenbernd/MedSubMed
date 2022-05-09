//	Import deployed addresses of MSM contracts 
const { atMSMFacade } = require('./MSMDeployedAddresses.js');


const MSMFacade		= artifacts.require("MSMFacade");
const Util1538		= artifacts.require("Util1538");
const UtilMSM		= artifacts.require("UtilMSM");
const MSMAdminUtils = artifacts.require("MSMAdminUtils"); 

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');	
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

//	Ensure the correct atMSMFacade environment variable is enabled in the .env file
//	for the Facade you wish to test. 
require('dotenv').config();

contract('The UtilMSM Contract . . .', async (accounts) => {
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade;
	let factID = "";
	let facSeqNum = "";
	let facadeIdentity = "(Identiry Unknown)";
	let iteration = "1";

	try { 
//*
		it(". . . initiates.", async () => { 
			ls("CONTRACT START:\t" + ts());
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating MSMFacade contract.");	
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				factID = facIDs[0].toString();
				facSeqNum = facIDs[1].toString();
				facadeIdentity = "#" + factID + "-" + facSeqNum;	
			}	
			ls("FACADE IDENTITY: " + facadeIdentity);
		});	
//*	Retrieves state variables 
		it(". . . retrieves certain state variables.", async () => {
			const sender = await msmFacade.getMsgSender.call(opts);
			assert.ok(sender, "Failure retrieving Sender.");
			ls("\n\t     msg.sender is " + sender);
			const txOrigin = await msmFacade.getTxOrigin.call(opts); 
			ls("\t        tx.origin is " + txOrigin);
			const owner = await msmFacade.getMSMOwner.call(opts); 
			ls("\t       msmOwner is " + owner);
			const oldTitle = await msmFacade.getMSMTitle.call(opts);
			ls("\t       msmTitle is '" + oldTitle + "'");
			const oldDesc = await msmFacade.getMSMDescription.call(opts);
			ls("\t msmDescription is '" + oldDesc + "'");
			const oldVers = await msmFacade.getMSMVersion.call(opts);
			ls("\t     msmVersion is '" + oldVers + "'");
		});	//*/
//*	Set and retrieve state variables
		it(". . . sets the values of msmDescription.", async () => {
			let newDesc = "Factory #" + factID + ", deployed Facade " + facSeqNum;
			if (iteration != "") {
				newDesc += "-" + iteration;
			}
			ls("\n\tThe new msmDescription should be '" + newDesc + "'");
			await msmFacade.setMSMDescription(newDesc, opts);
			ls("\t\tmsmDescription has been set.");	
			const retDesc = await msmFacade.getMSMDescription.call(opts);
			ls("\tNew msmDescription is '" + retDesc + "'");
		});
		it(". . . sets the value of msmVersion.", async () => {
			let newVers = "v0." + factID + "." + facSeqNum;
			if (iteration != '') {
				newVers += "-" + iteration;
			}
			ls("\n\tThe new msmVersion value should be'" + newVers + "'");
			await msmFacade.setMSMVersion(newVers, opts);
			ls("\t\tmsmVersion has been set.");	
			const retVers = await msmFacade.getMSMVersion.call(opts);
			ls("\tNew msmVersion is '" + retVers + "'");			
		});	
		it(". . . sets the values of msmTitle.", async () => {
			let newTitle = "MSM #" + factID + "-" + facSeqNum;
			if (iteration != '') {
				newTitle += "-" + iteration;
			}
			ls("\n\tThe new msmTitle value should be '" + newTitle + "'");
			await msmFacade.setMSMTitle(newTitle, opts);
			ls("\t\tmsmTitle has been set.");	
			const retTitle = await msmFacade.getMSMTitle.call(opts);
			ls("\tNew MSMTitle is '" + retTitle + "'");			
		});	//*/
//*
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});	//*/
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});