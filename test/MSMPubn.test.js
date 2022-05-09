//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atMSMPublication } = require('./MSMDeployedAddresses.js');
const { atMSMKeys } = require('./MSMDeployedAddresses.js');

const MSMFacade 	  = artifacts.require("MSMFacade");
const Util1538        = artifacts.require("Util1538");
const UtilMSM		  = artifacts.require("UtilMSM");
const MSMAdminUtils   = artifacts.require("MSMAdminUtils"); 
const MSMPublisher	  = artifacts.require("MSMPublisher");
const MSMPublication  = artifacts.require("MSMPublication");
const MSMKeys		  = artifacts.require("MSMKeys");

require('dotenv').config();

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

contract('The MSMPublication contract . . .', async (accounts) => { 
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	let MSM_PUBLISHER;
	
	//	Set following 3 constants to indices of first and last entries in accounts[]
	//	as Publishers for whom Publications will be added. 
	//	CONSTRAINT: Publishers must be sequential within accounts[] array;
	//				ergo pubrN must be set so that it is >= pubr1; also ensure that 
	//				pubrN < accounts.length
	//	Publishers for Facade #1: 2..7; #2: 8..11; #3: 0..5; #4: 4..9; #5: 1..10; #6: 5..11
	const MSM_FACADE 	  =  6;
	const FIRST_PUBLISHER =  5;
	const  LAST_PUBLISHER = 11;
	//	For testing, Publications are added for all but first and last Publishers, just for testing
	const pubr1 = FIRST_PUBLISHER + 2;	//	First Publisher in sequence
	const pubrN =  LAST_PUBLISHER - 2;	//	Last Publisher in sequence
	const n = (pubrN - pubr1) + 1;		//	Total number of Publishers
	const pubnsPerPubr = 5;				//	Number of Publications to add for each Publisher
	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	let opts = Object({from: MSM_MANAGER});
	
	let msmFacade, msmKeys;
	let numPubns = 0;
	let facadeIdentity = "(identity unknown)";

	try { 
//*
		it(". . . instantiates an MSMFacade contract object.", async () => { 
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublisher.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublication.abi);
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
		it(". . . retrieves the current value of MSMKeys.key.", async () => {
			msmKeys = await MSMKeys.at(atMSMKeys, opts);
			assert.ok(msmKeys, "Failure instantiating msmKeys");
			const currKey   = await msmKeys.current.call();
			ls("\n\tThe current value of the global key variable: " + currKey);
		});	//*/
//*
		it(". . . returns the total number of enrolled Publications.", async () => { 
			const opts = Object({from: MSM_OWNER});
			numPubns = Number(await msmFacade.getPublicationCount.call(opts));
			if (numPubns == 0) {
				ls("\n\tThere ain't no flamin' Publcations.");
			} else {
				ls("\n\tThe total number of enrolled Publications for all Publishers is " + numPubns + ".");
			}
		});	//*/
/*
		it(". . . removes all enrolled Publications.", async () => {
			ls("\n\tRemoving ALL registered Publications.");
			const opts = Object({from: MSM_OWNER});
			const trnsObj = await msmFacade.removeAllMSMPublications(opts);
			assert.ok(trnsObj, "Failure removing all MSMPublications.");
			ls("\t\t" + trnsObj.logs[0].args.countMsg + trnsObj.logs[0].args.numPubrs);
			ls("\t\t" + trnsObj.logs[1].args.msg + trnsObj.logs[1].args.limit);
			ls("\t\t" + trnsObj.logs[2].args.msg + trnsObj.logs[2].args.limit);
		});	//*/
/*
		it(". . . adds " + pubnsPerPubr + " Publications for each of " + n + " Publishers in ASCENDING oder.", async () => {
			let pubnNum = 0;
			for (let TARGET_PUBLISHER = pubr1; TARGET_PUBLISHER <= pubrN; TARGET_PUBLISHER += 1) { 
				MSM_PUBLISHER = accounts[TARGET_PUBLISHER];
				const opts = ({from: MSM_PUBLISHER}); 	//	Local to this function only
				ls("\n\tAdding " + pubnsPerPubr + " Publications for Publisher #" + TARGET_PUBLISHER + ":");
				for (let i = 1; i <=  pubnsPerPubr; i += 1){
					pubnNum +=1;
					const _title = "Pubn " + facadeIdentity + ": " + TARGET_PUBLISHER + "-" + (pubnNum);
					const _desc  = "Publication #" + pubnNum + " for Publisher #" + TARGET_PUBLISHER + " in Facade #" + facadeIdentity;
					const trnsObj = await msmFacade.addMSMPublication(_title, _desc, opts);
					assert.ok(trnsObj, "Failure adding Publication #" + i + " for Publisher #" + TARGET_PUBLISHER + "."); 
					const pubnKey = trnsObj.logs[0].args.pubnKey;
					ls("\t\tPubnKey: " + pubnKey + ": Title: '" + _title + "'; Description: '" + _desc + "'.");
				}
			}
		});	//*/
/*
		it(". . . adds " + pubnsPerPubr + " Publications for each of " + n + " Publishers in DESCENDING order.", async () => {
			let pubnNum = 0;
			for (let TARGET_PUBLISHER = pubrN; TARGET_PUBLISHER >= pubr1; TARGET_PUBLISHER -= 1) { 
				MSM_PUBLISHER = accounts[TARGET_PUBLISHER];
				const opts = ({from: MSM_PUBLISHER}); 	//	Local to this function only
				ls("\n\tAdding " + pubnsPerPubr + " Publications for Publisher #" + TARGET_PUBLISHER + ":");
				for (let i = 1; i <=  pubnsPerPubr; i += 1){
					pubnNum +=1;
					const _title = "Pubn " + facadeIdentity + ": " + TARGET_PUBLISHER + "-" + (pubnNum);
					const _desc  = "Publication #" + pubnNum + " for Publisher #" + TARGET_PUBLISHER + " in Facade #" + facadeIdentity;
					const trnsObj = await msmFacade.addMSMPublication(_title, _desc, opts);
					assert.ok(trnsObj, "Failure adding Publication #" + i + " for Publisher #" + TARGET_PUBLISHER + "."); 
					const pubnKey = trnsObj.logs[0].args.pubnKey;
					ls("\t\tPubnKey: " + pubnKey + ": Title: '" + _title + "'; Description: '" + _desc + "'.");
				}
			}
		});	//*/
/*
		it(". . . adds a single Publication for a single Publisher.", async () => {
			const TARGET_PUBLISHER = 9;
			MSM_PUBLISHER = accounts[TARGET_PUBLISHER];
			const opts = ({from: MSM_PUBLISHER});			//	Local to this function only
			ls("\n\tAdding a single Publication for Publisher #" + TARGET_PUBLISHER + ".");
			const currKey   = await msmKeys.current.call();
			const newKey = Number(currKey) + 1; 
			const _title = "Pubn # " + facadeIdentity + ": " + TARGET_PUBLISHER + "-" + newKey;
			const _desc  = "Publication #" + newKey + " for Publisher #" + TARGET_PUBLISHER + " in Facade #" + facadeIdentity;
			const trnsObj = await msmFacade.addMSMPublication(_title, _desc, opts);
			assert.ok(trnsObj, "Failure adding Publication #" + newKey + " for Publisher #" + TARGET_PUBLISHER + "."); 
			const pubnKey = trnsObj.logs[0].args.pubnKey;
			assert.equal(pubnKey, newKey, "pubnKey and newKey are should be equal but are not.");
			ls("\t\tPublication added: " + _desc);
			
	});	//*/
/*
		it(". . . returns the new total number of enrolled Publications.", async () => {
			const opts = {from: MSM_OWNER};
			numPubns = await msmFacade.getPublicationCount.call(opts);
			ls("\n\tNow the total number of enrolled Publications for all Publishers is " + numPubns + ".");
		});	//*/
/*
		it(". . . retrieves the Publisher address for a desginated Publication.", async () => {
			const opts = {from: MSM_OWNER};
			const pubnLen = Number(await msmFacade.getPublicationCount.call(opts));
			assert.isAbove(pubnLen, 0, "There are no registered Publications.");
			const i = pubnLen - 1;	//	Just arbitrarily select the last Pubn b/c it's easy to do so
			const retPubn  = await msmFacade.getMSMPublicationByIndex.call(i, opts);
			const pubnKey = retPubn[0];
			const pubrAddr1 = retPubn[3];
			const pubrAddr2 = await msmFacade.getPubnPubrAddress.call(pubnKey, opts); 
			assert.equal(pubrAddr1, pubrAddr2, "Failure retrieving Publisher address with getPubnPubrAddress()."); 
			const pubrRet = await msmFacade.getMSMPublisher.call(pubrAddr2, opts);
			const pubrName = pubrRet[1];
			ls("\n\tThe Publisher of Publication #" + (i+1) + " (Publication Key #" + pubnKey + ") is " + pubrName + ".");
		});	//*/
//*
		it(". . . retrieves the title and Publisher name for all registered Publications.", async () => { 
			const opts = ({from: MSM_OWNER});
			const numPubns = Number(await msmFacade.getPublicationCount.call(opts));
			if (numPubns == 0) { 
				ls("\n\tThere are no registered Publications.");
			}
			else {
				ls("\n\t" + ts() + "\tTitles and Publishers of all " + numPubns + " registered Publications:"); 	
				for (let i = 0; i < numPubns; i += 1) {
					const retPubn = await msmFacade.getMSMPublicationByIndex.call(i, opts);
					assert.ok(retPubn);
					//Use Publisher address to get Publisher name
					const retPubr = await msmFacade.getMSMPublisher.call(retPubn[3], opts);
					assert.ok(retPubr);
					ls("\t\t#" + retPubn[0] + " is published by " + retPubr[1] + ".");					
				}
				ls("\t" + ts());
			}
		});	//*/
/*
		it(". . . . retrieves Titles of all Publications for all Publishers specified in a list of Publishers.", async () => {
			ls("\n\tTitles of all Publications for a list of Publishers");
			let pubrIndxs = [10, 8, 11];			
			ls("\tFirst by scanning the global prblications[] array:");
			ls("\t" + ts());
			for (let i = 0; i < pubrIndxs.length; i += 1) {
				const pubrAddr = accounts[pubrIndxs[i]];
				opts = ({from: pubrAddr});
				const retKeys = await msmFacade.getPubrPubnKeys.call(pubrAddr, opts);
				for (let j = 0; j < retKeys.length; j += 1) {
					const retPubn = await msmFacade.getMSMPublicationByKey.call(retKeys[j], opts);
					ls("\t\tTitle of Publication #" + (j + 1) + " for Publisher #" + pubrIndxs[i] + ": " + retPubn[1] + " with pubnKey=" + retPubn[0] );
				}	
			}
			ls("\t" + ts());	
			ls("\tSecond by using publications[] in Publication objects in pubrMap:");
			for (let i = 0; i < pubrIndxs.length; i += 1) {
				const pubrAddr = accounts[pubrIndxs[i]];
				opts = ({from: pubrAddr});
				const retPubr = await msmFacade.getMSMPublisher.call(pubrAddr, opts);
				const pubnInds = retPubr[3];
				ls("\t\tLength of array pubnInds is " + pubnInds.length);
				for (let j = 0; j < pubnInds.length; j += 1) {
					ls("\t\tpubnInds[" + j + "]=" + pubnInds[j]);
					const retPubn = await msmFacade.getMSMPublicationByIndex.call(pubnInds[j], opts);
					ls("\t\tTitle of Publication #" + (j + 1) + " for Publisher #" + pubrIndxs[i] + ": " + retPubn[1] + " with pubnKey=" + retPubn[0] );
				}	
			}
			ls("\t" + ts());
		});	//*/
/*
		it(" . . . retrieves a list of all Publications for Publishers.",async () => {
			ls("\n\tPublication keys for all Publishers:");
			let opts = ({from: MSM_MANAGER});
			const pubrAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
			const pubrCount = await msmFacade.getMSMPublisherCount(opts);
			ls("\t\tpubrCount=" + pubrCount);
			assert.equal(pubrAddrs.length, pubrCount, "Invalid length for Publishers returned.");			
			for (let i = 0; i < pubrCount; i += 1) {	
				const pubrAddr = pubrAddrs[i];
				opts = ({from: pubrAddr});
				const pubr = await msmFacade.getMSMPublisher.call(pubrAddr, opts);
				ls("\n\t\tFor " + pubr[1] + ":");
				const pubrPubnKeys = await msmFacade.getPubrPubnKeys.call(pubrAddr, opts);
				ls("\t\tpubrPubnKeys.length=" + pubrPubnKeys.length);
//*				
				for (let j = 0; j < pubrPubnKeys.length; j += 1) {
					const retPubn = await msmFacade.getMSMPublicationByKey(pubrPubnKeys[j], opts);
					ls("\t\t\tPublication Key #" + Number(retPubn[0]) + ": " + retPubn[1]);
				}	
			}	
		});	//*/
/*
		it(". . . retrieves keys of All Publications, for Owner / active Managers, and for active Publsihers.", async () => {
			let opts = Object( {from: MSM_MANAGER });
			const retKeys = await msmFacade.getAllMSMPubnKeys.call(opts); 
			ls("\n\tThe keys of all " + retKeys.length + " Publications, available to the Owner or a Manager:");
			let keyStr = "";
			for (let i = 0; i < retKeys.length; i += 1) {
				keyStr += retKeys[i] + "; ";
			}
			ls("\t\t" + keyStr);
			
			//	Now for each Publisher in turn
			const pubrAddrs = await msmFacade.getAllMSMPubrAddrs(opts);
			for (let i = 0; i < pubrAddrs.length; i += 1) {
				const pubrAddr = pubrAddrs[i]; 
				opts = Object( {from: pubrAddr} );
				const retKeys = await msmFacade.getAllMSMPubnKeys(opts);
				keyStr = "";
				for (let i = 0; i < retKeys.length; i +=1) {
					keyStr += (retKeys[i] + "; ");
				}
				ls("\n\tThe keys of all " + retKeys.length + " Publications for PUBLISHER #" + (Number(FIRST_PUBLISHER) + i) + " only:\n\t\t" + keyStr);
			}
		});	//*/
/*
		it(". . . retrieves keys of ACTIVE Publications, for Owner / active Managers, and for active Publishers.", async () => {
			let opts = Object( {from: MSM_MANAGER });
			const retKeys = await msmFacade.getActiveMSMPubnKeys.call(opts); 
			ls("\n\tThe keys of " + retKeys.length + " active Publications, available to the Owner or a Manager:");
			let keyStr = "";
			for (let i = 0; i < retKeys.length; i += 1) {
				keyStr += retKeys[i] + "; ";
			}
			ls("\t\t" + keyStr);
			
			//	Now for each Publisher in turn
			const pubrAddrs = await msmFacade.getActiveMSMPubrAddrs(opts);
			ls("\n\tLength of array of addresses of active Publishers is " + pubrAddrs.length);
			for (let i = 0; i < pubrAddrs.length; i += 1) {
				const pubrAddr = pubrAddrs[i]; 
				opts = Object( {from: pubrAddr} );
				const retKeys = await msmFacade.getActiveMSMPubnKeys(opts);
				keyStr = "";
				for (let i = 0; i < retKeys.length; i +=1) {
					keyStr += (retKeys[i] + "; ");
				}
				ls("\n\tThe keys of active " + retKeys.length + " Publications for PUBLISHER #" + (Number(FIRST_PUBLISHER) + i) + " only:\n\t\t" + keyStr);
			}
		});	//*/
//*
		it(". . . retrieves all Subscriptions for a specified Publication.", async () => {
			const opts = ({from: MSM_OWNER});
			const pubnCount_ = await msmFacade.getPublicationCount.call(opts);
			ls("\n\tThe total number of Publications is " + pubnCount_ + ".");
			const _pubnIndex = pubnCount_ - 1;
			const retPubn = await msmFacade.getMSMPublicationByIndex(_pubnIndex, opts);
			const _pubnKey = retPubn[0];
			const retSubns = await msmFacade.getMSMPublicationSubscriptions(_pubnKey, opts);			
			ls("\n\tNumber of Subscriptions for pubnKeys[" + _pubnKey + "] is " + retSubns.length + ".");
			for (let i = 1; i <= retSubns.length; i += 1) {
				ls("\t\t" + i + "\tPublication Key: " + retSubns[i-1].pubnKey + "; Subscription Key: " + retSubns[i-1].subnkey);
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