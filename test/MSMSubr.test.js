//	Import deployed addresses of MSM contracts 
const { atMSMFacade } = require('./MSMDeployedAddresses.js');

const MSMFacade 	= artifacts.require("MSMFacade");
const MSMSubscriber  = artifacts.require("MSMSubscriber");
const Util1538      = artifacts.require("Util1538");		
const UtilMSM		= artifacts.require("UtilMSM");			
const MSMAdminUtils = artifacts.require("MSMAdminUtils");	

require('dotenv').config();

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

contract('The MSMSubscriber contract . . .', async (accounts) => { 
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	
	//	Set following 3 constants to active facade and 
	//	to indices of first and last entries in accounts[]
	//	that will be added as Subscribers. 
	//	At conclusion of test, reset these 3 varaibles to null.
	//	CONSTRAINT: Subscribers must be sequential within accounts[] array;
	//				ergo subrN must be set so that it is >= subr1
	//	For Facades: #1: 5..9; #2: 10..13; #3: 11..14; #4: 2..8; #5: 8..12; #6: [12..14]
	const MSM_FACADE 		= 6;
	const FIRST_SUBSCRIBER	= 12;
	const LAST_SUBSCRIBER	= 14;
	const subr1 = FIRST_SUBSCRIBER;				//	First Subscriber in sequence
	const subrN =  LAST_SUBSCRIBER;				//	Last Subscriber in sequence
	const n = (subrN - subr1) + 1;				//	Total number of Subscribers
	const targ = subr1 + Math.trunc(n / 2);		//	Index of a single target account
	
	const opts = Object({from: MSM_MANAGER});
	
	let msmFacade;
	let facadeIdentity = "(identity unknown)";

	try { 
//*
		it(". . . initiates.", async () => { 
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi); 		
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);			 
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriber.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);	
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating an MSMFacade contract object.");
			
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
			ls("CONTRACT  START:\t" + ts());
			ls("FACADE IDENTITY:\t" + facadeIdentity);
		});	
//*	
		it(". . . may begin with some registered Subscribers.", async () => {
			const subrCount = Number(await msmFacade.getMSMSubscriberCount.call(opts));
			if(subrCount == 0) {
				ls("\n\tThere are no registered Subscribers.");
				return;
			}
			ls("\n\tWe begin with " + subrCount + " registered Subscribers:");
			const subrAddrs = await msmFacade.getAllMSMSubrAddrs.call(opts);
			assert.ok(subrAddrs, "Failure in getAllMSMSubrAddrs()");

			for (let i = 0; i < subrAddrs.length; i += 1) {
				ls("\t\t" + subrAddrs[i]);
			}	
		});	//*
//*
		it(". . . removes all registered Subscribers - first attempt.", async () => {
			ls("\n\tRemoving all registered Subscribers.");
			const oldCount = await msmFacade.getMSMSubscriberCount.call(opts);
			if (oldCount == 0) {
				ls("\n\tThere are no registered Subscribers.");
				return;
			}
			ls("\t\tThere are " + oldCount + " registered Subscribers to start.");
			const ownerOnly = Object({ from: MSM_OWNER });
			const trnsObj = await msmFacade.removeAllMSMSubscribers(ownerOnly);
			const newCount =  await msmFacade.getMSMSubscriberCount.call(opts);
			assert.equal(newCount, 0, "Failure removing all registered Subscribers` - first attempt.");
			ls("\t\tThere are now " + newCount + " registered Subscribers.");
		});	//*/
/*
		it(". . . adds a single Subscriber and displays the position of insertion.", async () => {
			ls("\n\tAdding accounts[" + subr1 + "] as a registered Subscriber.");
			const trnsObj = await msmFacade.addMSMSubscriber(accounts[subr1], opts);
			if (trnsObj.logs[0] != undefined) {
				ls("\n\t\tSubscriber #" + trnsObj.logs[0].args.position + " added with address:\t" + trnsObj.logs[0].args.subrAddress);
			}
		});	//*/
//*
		it(". . . adds up to " + n + " registered Subscribers - first attempt.", async () => {
			ls("\n\tAdding " + n + " registered Subscribers:");
			for (let i = subr1; i <= subrN; i += 1) { 
				const trnsObj = await msmFacade.addMSMSubscriber(accounts[i], opts);
				if (trnsObj.logs[0] != undefined) {
					ls("\t\tSubscriber #" + trnsObj.logs[0].args.position + " added with address:\t" + trnsObj.logs[0].args.subrAddress);
				}
			}
			const count = await msmFacade.getMSMSubscriberCount.call(opts);
			assert.equal(count, n, "Failure in adding " + n + " registered Subscribers - first attempt.");
			ls("\tNow there are " + count + " registered Subscribers.");
		});	//*
/*
		it(". . . checks all Ganache accounts[] as registered Subscribers.", async () => {
			ls("\n\tChecking on all Ganache accounts[] as registered Subscribers:");
			let subrCount = 0;
			for (let i = 0; i < accounts.length; i += 1) { 
				const subrRet = await msmFacade.getMSMSubscriber.call(accounts[i], opts);
				assert.ok(subrRet, "Failure checking Ganache accounts[" + i + "] as registered Subscriber.");
				ls("\t\t" + i + ":\t" + subrRet[0] +  ": Active=" + subrRet[1] + ";  Subscriptions: " + subrRet[2].length);
				if (subrRet[1] == true) {
					subrCount += 1;
				}
			}
			ls("\t\tThere are " + subrCount + " active Subscribers."); 
		});	//*/
//*
		it(". . . removes accounts[targ] as registered Subscriber.", async () => {
			ls("\n\tRemoving account accounts[" + targ + "]:");
			const trnsObj = await msmFacade.removeMSMSubscriber(accounts[targ], opts);
			assert.ok(trnsObj, "Failure removing accounts[" + targ + "].");
			if (trnsObj.logs[0] != undefined) {
				const position = trnsObj.logs[0].args.position;
				const subrAddress = trnsObj.logs[0].args.subrAddress;
				ls("\t\tRemoved Subscriber #" + position + " at " + subrAddress);
			} else {
				ls("\t\tAccount NOT removed, probably because it was not a Subscriber in the first place.");
			}
			const subrRet = await msmFacade.getMSMSubscriber.call(accounts[targ], opts);
			assert.equal(subrRet[0], 0x0, "Failure removing Ganache accounts[" + targ + "] as registered Subscriber.");
			const subrCount = await msmFacade.getMSMSubscriberCount.call(opts);
			ls("\t\tThere are now " + subrCount + " remaining registered Publishers.");
		});	//*/	
//*
		it(". . . removes all registered Subscribers - second attempt.", async () => {
			ls("\n\tRemoving all registered Subscribers.");
			ls("\t\tBeginning number of Subscribers: " + await msmFacade.getMSMSubscriberCount.call(opts));
			const retVal = await msmFacade.getAllMSMSubrAddrs.call(opts);
			const subrCount = retVal.length;
			if (subrCount == 0) { 
				ls("\n\tThere are no Subscribers to be removed.");
				return;
			}
			for (let i = 0; i < subrCount; i += 1) {
				const trnsObj = await msmFacade.removeMSMSubscriber(retVal[i], opts);
				ls("\t\t\tRemoving Subscriber[" + i + "]:\t" + trnsObj.logs[0].args.subrAddress + ".");
			}
			const newCount = await msmFacade.getMSMSubscriberCount.call(opts);
			assert.equal(newCount, 0, "Failure removing all registered Subscribers - second attempt.");
			ls("\n\t\tEnding number of Subscribers: " + newCount);
		});	//*/
//*
		it(". . . adds " + n + " registered Subscribers - second attempt.", async () => {
			ls("\n\tAdding " + n + " registered Subscribers:");
			for (let i = subr1; i <= subrN; i += 1) { 
				const trnsObj = await msmFacade.addMSMSubscriber(accounts[i], opts);
				if (trnsObj.logs[0] != undefined) {
					ls("\t\tSubscriber #" + trnsObj.logs[0].args.position + " added with address:\t" + trnsObj.logs[0].args.subrAddress);
				}
			}
			const newCount = await msmFacade.getMSMSubscriberCount.call(opts);
			assert.equal(newCount, n, "Failure in adding " + n + " registered Subscribers - first attempt.");
			ls("\tNow there are " + newCount + " registered Subscribers.");
		});	//*/
/*		
		it(". . . finds " + n + " remaining registered Subscribers.", async () => {
			let count = await msmFacade.getMSMSubscriberCount.call(opts);
			ls("\n\tThere are " + count + " remaining registered Subscribers:");
			assert.equal(count, n, "Failure finding " + n + " remaining registered Subscribers.");
			const subrAddrs = await msmFacade.getAllMSMSubrAddrs.call(opts);
			count = subrAddrs.length;
			for (let i = 0; i < count; i += 1) {
				ls("\t\t" + subrAddrs[i]);
			}	
		});	//*/
//*
		it(". . . deactivates accounts[" + targ + "].", async () => {
			ls("\n\tDeactivating accounts[" + targ + "]: " + accounts[targ]);
			await msmFacade.deactivateMSMSubscriber(accounts[targ], opts);
		});	//*/
//*
		it(". . . retrieves addresses of active Subscribers only.", async () => {
			ls("\n\tRetrieving addresses for active Subscribers only:");
			const retVal = await msmFacade.getActiveMSMSubrAddrs(opts);
			const count = retVal.length;
			ls("\t\tThere are " + count + " active Subscribers.");
			for (let i = 0; i < count; i += 1) {
				ls("\t\t\t" + retVal[i]);
			}
		});	//*/
//*
		it(". . . reactivates accounts[" + targ + "].", async () => {
			ls("\n\tReactivating accounts[" + targ + "]: " + accounts[targ]);
			await msmFacade.activateMSMSubscriber(accounts[targ], opts);
		});	//*/
//*
		it(". . . retrieves addresses of active Subscribers only.", async () => {
			ls("\n\tRetrieving addresses for active Subscribers only:");
			const retVal = await msmFacade.getActiveMSMSubrAddrs(opts);
			const count = retVal.length;
			ls("\t\tThere are " + count + " active Subscribers.");
			for (let i = 0; i < count; i += 1) {
				ls("\t\t\t" + retVal[i]);
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