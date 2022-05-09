//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atMSMManager } = require('./MSMDeployedAddresses.js');


const MSMFacade = artifacts.require("MSMFacade");
const Util1538 = artifacts.require("Util1538");
const UtilMSM = artifacts.require("UtilMSM");
const MSMManager   = artifacts.require("MSMManager");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');	
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

require('dotenv').config();

contract('The MSMManager Contract . . .', async (accounts) => {
	
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	//	Set following 2 constants to indices of first and last entries in accounts[]
	//	that will be added as Managers. 
	//	CONSTRAINT: Managers must be sequential within accounts[] array;
	//				ergo mngrN must be set so that it is >= mngr1;
	//				also mngrN must be < accounts.length. 
	const mngr1 = Number(process.env.MSM_MANAGER);	//	First Manager in sequence
	const mngrN = 2;								//	Last Manager in sequence
	const n = (mngrN - mngr1) + 1;					//	Total number of Managers
	
	const opts = Object({from: MSM_OWNER}); 
	
	let msmFacade;
	
	try { 
//*
		it(". . . initiates.", () => { 
			ls("CONTRACT START:\t" + ts());
		});	//*/
		it(". . . instantiates the MSMFacade contract.", async () => {
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMManager.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating MSMFacade contract.");
			
			let facadeIdentity = "(Identity Unknown)";
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("FACADE IDENTITY: " + facadeIdentity);
		});	
		it(". . . returns the number of registered Managers.", async () => {
			const mngrCount = await msmFacade.getMSMManagerCount.call(opts);
			ls("\n\tThere currently are " + mngrCount + " registred MSM Managers.");
		});		
/*		
		it(". . . removes all registered Managers except the first.", async () => {
			const mngrAddrs = await msmFacade.getAllMSMManagers.call(opts);
			for (let i = 1; i < mngrAddrs.length; i += 1) {
				const mngrAddr = mngrAddrs[i];
				const trnsObj = await msmFacade.removeMSMManager(mngrAddr, opts);
			}
			const count = await msmFacade.getMSMManagerCount.call(opts);
			assert.equal(count, 1, "Failure in deleting all Managers - count=" + count + "; should be 1.");
			ls("\n\tNow there is " + count + " registered Manager.");
		});	//*/
//*
		it(". . . adds accounts[" + mngr1 + ".." + mngrN + "] as Managers a first time.", async () => { 
			for (let i = mngr1; i <= mngrN; i += 1) { 
				const acct = accounts[i];
				const trnsObj = await msmFacade.addMSMManager(acct, opts);	
				assert.ok(trnsObj, "Failure calling addMSMManager().");
				if (trnsObj.logs[0] == undefined) {
					continue;	//	B/C it already exists as a Manager
				} else {
					const mngrAddress = trnsObj.logs[0].args.mngrAddress;
					const position = trnsObj.logs[0].args.position;
					//	A statement to log retrun argurments could go here
				}	
			}
			const count = await msmFacade.getMSMManagerCount.call(opts);
			ls("\n\tAnd now there are " + count + " registered Managers.");
		});	//*/
//*
		it(". . . retrieves all MSM Managers in a single function call.", async () => {
			const mngrs = await msmFacade.getAllMSMManagers.call(opts);
			ls("\n\tThere are " + mngrs.length + " resistered Managers, as follows:");
			for (let i = 0; i < mngrs.length; i += 1) {
				ls("\t\t" + mngrs[i]);
			}
		});	//*/
/*
		it(". . . removes all but the first Manager.", async () => {
			let mngrAddrs = await msmFacade.getAllMSMManagers.call(opts);
			for (let i = 1; i < mngrAddrs.length; i += 1) {
				const mngrAddr = mngrAddrs[i];
				const trnsObj = await msmFacade.removeMSMManager(mngrAddr, opts);
				
				const mngrAddress = trnsObj.logs[0].args.mngrAddress;
				const position = trnsObj.logs[0].args.position;
				//	A statement to log retrun argurments could go here
			}
			const count = await msmFacade.getMSMManagerCount.call(opts);
			assert.equal(count, 1, "Failure in deleting all but first Manager - count=" + count + "; should be 1.");
			mngrs = await msmFacade.getAllMSMManagers.call(opts);
			assert.equal(mngrs[0], MSM_MANAGER, "Failure in deleting all but first - remaining Manager is not MSM_MANAGER.");
		});	//*/
/*		
		it(". . . adds accounts[" + mngr1 + ".." + mngrN + "] as Managers a second time.", async () => { 
			for (let i = mngr1; i <= mngrN; i += 1) { 
				const acct = accounts[i];
				const trnsObj = await msmFacade.addMSMManager(acct, opts);	
				assert.ok(trnsObj, "Failure calling addMSMManager().");
				if (trnsObj.logs[0] == undefined) { // B/C it's already there
					continue;
				} else {
					const mngrAddress = trnsObj.logs[0].args.mngrAddress;
					const position = trnsObj.logs[0].args.position;
					//	A statement to log retrun argurments could go here
				}	
			}
			const count = await msmFacade.getMSMManagerCount.call(opts);
			assert.equal(count, n, "Failure adding " + n + " Managers.");
			ls("\n\tFinally, there are " + count + " registered Managers.");
		});	//*/
//*
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});	//*/
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});