//	Import deployed addresses of MSM contracts 
const { atMSMFacade } = require('./MSMDeployedAddresses.js');

const MSMFacade 	= artifacts.require("MSMFacade");
const MSMPublisher  = artifacts.require("MSMPublisher");
const Util1538      = artifacts.require("Util1538");	
const UtilMSM		= artifacts.require("UtilMSM");		
const MSMAdminUtils  = artifacts.require("MSMAdminUtils");	

require('dotenv').config();

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

contract('The MSMPublisher contract . . .', async (accounts) => { 
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];	
	
	//	Set following 3 constants to indices of first and last entries in accounts[]
	//	as Publishers for whom Publications will be added. 
	//	CONSTRAINT: Publishers must be sequential within accounts[] array;
	//				ergo pubrN must be set so that it is >= pubr1; also ensure that 
	//				pubrN < accounts.length
	//	Publishers for Facade #1: 2..7; #2: 8..11; #3: 0..5; #4: 4..9; #5: 1..10; #6: 5..11
	const MSM_FACADE = null;
	const FIRST_PUBLISHER = 5;
	const  LAST_PUBLISHER = 11;
	const pubr1 = FIRST_PUBLISHER;		//	First Publisher in sequence
	const pubrN = LAST_PUBLISHER;		//	Last Publisher in sequence
	const n = (pubrN - pubr1) + 1;		//	Total number of Publishers
	
	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade;
	let facadeIdentity = "(identity unknown)";

	try { 
		it(". . . instantiates an MSMFacade contract object.", async () => { 
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublisher.abi); 
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi); 	
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);		
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating an MSMFacade contract object.");
			
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("CONTRACT START:\t" + ts());
			ls("FACADE IDENTITY: " + facadeIdentity);
		});	
//*	
		it(". . . may begin with some registered Publishers.", async () => { 
			const pubrCount = Number(await msmFacade.getMSMPublisherCount.call(opts));
			ls("\n\tWe begin with " + pubrCount + " registered Publishers:");
			if (pubrCount > 0) {
				const pubrAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
				assert.ok(pubrAddrs, "Failure in getAllMSMPubrAddrs()"); 
				for (let i = 0; i < pubrAddrs.length; i += 1) {
					ls("\t\t" + pubrAddrs[i]);
				}	
			}
		});	//*/
//*
		it(". . . removes all registered Publishers - first attempt.", async () => { 
			const oldCount = await msmFacade.getMSMPublisherCount.call(opts);
			if (oldCount > 0) { 
				const trnsObj = await msmFacade.removeAllMSMPublishers(opts);
			}
			const newCount =  await msmFacade.getMSMPublisherCount.call(opts);
			assert.equal(newCount, 0, "Failure removing all registered Publishers - first attempt.");
			ls("\n\tThere are now " + newCount + " registered Publishers.");
		});	//*/
//*
		it(". . . adds " + n + " registered Publishers: accounts[" + pubr1 + ".." + pubrN + "].", async () => { 
			for (let i = pubr1; i <= pubrN; i += 1) { 
				const nom = "Publisher #" + facadeIdentity + ", pbr" + i;
				const trnsObj = await msmFacade.addMSMPublisher(accounts[i], nom, opts);
			}
			const count = await msmFacade.getMSMPublisherCount.call(opts);
			assert.equal(count, n, "Failure in adding " + n + " registered Publishers - first attempt.");
		});	//*/
//*
		it(". . . checks all Ganache accounts[] as registered Publishers.", async () => {
			let pubrCount = 0;
			for (let i = 0; i < accounts.length; i += 1) { 
				const pubrRet = await msmFacade.getMSMPublisher.call(accounts[i], opts);
				assert.ok(pubrRet, "Failure checking Ganache accounts[" + i + "] as registered Publisher.");
				ls("\t\t" + i + ":\t" + pubrRet[0] + "\n\t\t\t" + pubrRet[1] + ": Active?\t" + pubrRet[2] + "; Publications:\t" + pubrRet[3].length);
				if (pubrRet[2] == true) {
					pubrCount += 1;
				}
				if (pubrRet[3].length > 0) {
					for (let j = 0; j < pubrRet[3].length; j += 1) {
						ls("\t\t\t\t" + pubrRet[j].pubnTitle);
					}
				}	
			}
		});	//*/
//*
		it(". . . removes accounts[7] as registered Publisher.", async () => {
			ls("\n\tRemoving account " + accounts[7] + ":");
			const trnsObj = await msmFacade.removeMSMPublisher(accounts[7], opts);
			assert.ok(trnsObj, "Failure removing accounts[7].");
			const position = trnsObj.logs[0].args.position;
			const pubrName = trnsObj.logs[0].args.pubrName;
			const pubrAddr = trnsObj.logs[0].args.pubrAddr;
			ls("\t\tRemoved Publisher #" + position + ": " + pubrName + " at " + pubrAddr);
			const pubrRet = await msmFacade.getMSMPublisher.call(accounts[7], opts);
			assert.equal(pubrRet[0], 0x0, "Failure removing Ganache accounts[7] as registered Publisher.");
			const pubrCount = await msmFacade.getMSMPublisherCount.call(opts);
			ls("\t\tThere are now " + pubrCount + " remaining registered Publishers.");
		});	//*/	
//*
		it(". . . removes all registered Publishers - second attempt.", async () => {
			ls("\n\tBeginning number of Publishers: " + await msmFacade.getMSMPublisherCount.call(opts));
			const retVal = await msmFacade.getAllMSMPubrAddrs.call(opts);
			const dudeLength = retVal.length;
			for (let i = 0; i < dudeLength; i += 1) { 
				const trnsObj = await msmFacade.removeMSMPublisher(retVal[i], opts);
				ls("\t\t" + trnsObj.logs[0].args.pubrName + " removed from Publisher at position " + trnsObj.logs[0].args.position + " with address:\n\t\t" + trnsObj.logs[0].args.pubrAddress);
			}
			const count = await msmFacade.getMSMPublisherCount.call(opts);
			assert.equal(count, 0, "Failure removing all registered Publishers - second attempt.");
			ls("\n\t\tEnding number of Publishers: " + count);
		});	//*/
//*
		it(". . . adds " + n + " registered Publishers - second attempt.", async () => {
			for (let i = pubr1; i <= pubrN; i += 1) { 
				const nom = "Publisher #" + facadeIdentity + ", pbr" + i;
				const trnsObj = await msmFacade.addMSMPublisher(accounts[i], nom, opts);
			}
			const count = await msmFacade.getMSMPublisherCount.call(opts);
			assert.equal(count, n, "Failure in adding " + n + " registered Publishers - second attempt.");
		});	//*/
/*		
		it(". . . finds " + n-1 + " remaining registered Publishers.", async () => {
			const count = await msmFacade.getMSMPublisherCount.call(opts);
			assert.equal(count, n - 1, "Failure finding " + n-1 + " remaining registered Publishers.");
			const pubrAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts
		});	//*/
/*
		it(". . . deactivates accounts[12].", async () => {
			await msmFacade.deactivateMSMPublisher(accounts[12]);
		});
			//*/
/*
		it(". . . activates accounts[12].", async () => {
			await msmFacade.activateMSMPublisher(accounts[12]);
		});
			//*/
//*
		it(". . . deactivates all registered Publishers.", async () => {
			ls("\n\tDeactivating all registered Publishers.");
			const retAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
			for (let i = 0; i < retAddrs.length; i += 1) {
				const trnsObj = await msmFacade.deactivateMSMPublisher(retAddrs[i]);
				assert.ok(trnsObj, "Failure deactivating Publisher[" + i + ".");
				ls("\t\tDeactviated " + trnsObj.logs[0].args. pubrName + ".");
			}
		});	//*/
//*
		it(". . . activates all registered Publishers.", async () => { 
			ls("\n\tActivating all registered Publishers.");
			const retAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
			for (let i = 0; i < retAddrs.length; i += 1) {
				const trnsObj = await msmFacade.activateMSMPublisher(retAddrs[i]);
				assert.ok(trnsObj, "Failure activating Publisher[" + i + ".");
				ls("\t\tActviated " + trnsObj.logs[0].args. pubrName + ".");
			}
		});	//*/
//*
		it(". . . retrieves the addresses only of ACTIVE Publishers.", async() => {
			const retAddrs = await msmFacade.getActiveMSMPubrAddrs.call();
			ls("\n\tThere are " + retAddrs.length + " active Publisher addresses, to wit:");
			for (let i = 0; i < retAddrs.length; i += 1) {
				ls("\t\t" + (i+1) + ":\t" + retAddrs[i]);
			}
		});
//*
		it(". . . retrieves all ACTIVE MSMPublishers.", async () => {
			const trnsObj = await msmFacade.getActiveMSMPublishers(opts);
			const activeNames = trnsObj[0]; 
			const activeAddrs = trnsObj[1]; 
			assert.equal(activeNames.length, activeAddrs.length, "Number of active names and number of active addresses is not equal.");
			ls("\n\tThere are " + activeNames.length + " active Publishers, to wit:");
			for (let i = 0; i < activeNames.length; i += 1) {
				ls("\t\t" + (i + 1) + ":\t" + activeNames[i]);
			}
		});		//*/
//*	
		it(". . . may end with some registered Publishers.", async () => {
			const pubrCount = Number(await msmFacade.getMSMPublisherCount.call(opts));
			ls("\n\tWe end with " + pubrCount + " registered Publishers:");
			if (pubrCount > 0) {
				const pubrAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
				assert.ok(pubrAddrs, "Failure in getAllMSMPubrAddrs()");
				for (let i = 0; i < pubrAddrs.length; i += 1) {
					ls("\t\t" + pubrAddrs[i]);
				}	
			}
		});	//*/
//*
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});	//*/
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});