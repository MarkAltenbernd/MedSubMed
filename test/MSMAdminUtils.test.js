const { atMSMSubnNFTUtils } = require('./MSMDeployedAddresses.js');
const { atMSMFacade } 		= require('./MSMDeployedAddresses.js');

const MSMFacade 			= artifacts.require("MSMFacade");
const Util1538				= artifacts.require("Util1538");
const UtilMSM 				= artifacts.require("UtilMSM");
const MSMAdminUtils			= artifacts.require("MSMAdminUtils");
const MSMManager			= artifacts.require("MSMManager");
const MSMSubscriptUtils		= artifacts.require("MSMSubscriptUtils");	
const MSMSubnNFTUtils		= artifacts.require("MSMSubnNFTUtils");	

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMAdminUtils contract . . .', async (accounts) => { 
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	let opts;
	opts = Object({from: MSM_MANAGER});
	
	let msmFacade, msmSubnNFTUtils;

	try { 
		it(". . . initiates.", () => { 
			ls("CONTRACT START:\t" + ts());
		});
		it(". . . instantiates the base contract object.", async () => { 
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);		
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMManager.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubnNFTUtils.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriptUtils.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating MSMFacade.");
		});	
//*		
		it(". . . returns a list of all Subscription keys, in rows of 5 items:", async () => { 
			const sKs = await msmFacade.getAllMSMSubnKeys.call(opts); 
			ls("\n\tThere is a list of " + sKs.length + " Subscription keys that has been returned:");
			for (let i = 0; i < sKs.length; i += 5) {
				ls("\t\t" + i + ":\t" + sKs[i] + "\t" + sKs[i+1] + "\t" + sKs[i+2] + "\t" + sKs[i+3] + "\t" + sKs[i+4]);
			}
		});	//*/
//*		
		it(". . . returns a list of all NFT keys, in rows of 5 items.", async () => {
			const nKs = await msmFacade.getSubnNFTKeys.call(opts);
			ls("\n\tThere is a list of " + nKs.length + " NFT keys that has been returned:");
			for (let i = 0; i < nKs.length; i += 5) {
				ls("\t\t" + i + ":\t" + nKs[i] + "\t" + nKs[i+1] + "\t" + nKs[i+2] + "\t" + nKs[i+3] + "\t" + nKs[i+4]);
			}
		});	//*/
//*
		it(". . . finds the index of the middlemost Subscription.", async () => {
			const sKs = await msmFacade.getAllMSMSubnKeys.call(opts);
			const midIndex = (sKs.length / 2).toFixed(0);
			const midKey = sKs[midIndex];
			ls("\n\tThere are " +  sKs.length + " Subscriptions that we know about. " + "\n\tThe index of the middle Subscription is " + midIndex + ".\n\tThe key   of the middle Subscription is " + midKey + ".");
		});	//*/
//*
		it(". . . finds the index of the middlemost NFT.", async () => {
			const nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			ls("\n\tThere are " + nftCount + " NFTs that we know about.");
			const midIndx = (nftCount / 2).toFixed(0);
			ls("\tThe index of the middle NFT is " + midIndx + ".");
			const nftKeys = await msmFacade.getSubnNFTKeys(opts); 
			if (nftCount != nftKeys.length) {
				ls("\n\tSomething's ferschluggener! nftCount (" + nftCount + ") does not equal the number of items in the nftKeys array  (" + nftKeys.length + ")."); 
				return;
			}
			const midKey  = nftKeys[midIndx];
			ls("\tThe key   of the middle NFT is " + midKey + ".");
		});	//*/
/*
		it(". . . removes the last NFT.", async() => {
			let nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			let lastIndex = (nftCount - 1).toFixed(0);
			ls("\n\tTo begin there are " + nftCount + " NFTs.");
			ls("\tThe index of the last NFT is " + lastIndex + ".");
			let nftKeys = await msmFacade.getSubnNFTKeys.call(opts);
			const count = nftKeys.length;
			const lastKey = nftKeys[count - 1];
			ls("\tThere are " + count + " NFT keys, the last of which is " + lastKey + ".");
			ls("\n\tRemoving the last NFT with key value of " + lastKey + ".");
			const trnsObj = await msmFacade.removeMSMSubnNFT(lastKey, opts);
			if (trnsObj.logs[0] == undefined) {
				ls("\tNo matching NFT key was found in DApp state storage.");
				return;
			} 
			const  nftKey = trnsObj.logs[0].args.nftKey;
			const nftAddr = trnsObj.logs[0].args.nftAddr;
			ls("\tNFT# " + nftKey + " at " + nftAddr + " has been removed.");
			nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			lastIndex = (nftCount - 1).toFixed(0);
			ls("\n\tNow there are  " + nftCount + " NFTs.");
			nftKeys = await msmFacade.getSubnNFTKeys.call(opts);
			ls("\tThe index of the last NFT is " + (nftKeys.length - 1) + ".");
			ls("\tThe value of the last NFT's key is " + nftKeys[nftKeys.length - 1] + ".");
		});	//*/
/*
		it(". . . removes the middle-most NFT.", async() => { 			
			const nKs = await msmFacade.getSubnNFTKeys.call(opts);
			const count = nKs.length;
			let midIndex = (count / 2).toFixed(0);
			const midKey = nKs[midIndex];
			ls("\n\tTo begin there are " + count + " NFTs.");
			ls("\tThe index    of the middlest NFT is " + midIndex + ".");
			ls("\tThe key      of the middlest NFT is " + midKey + ".");
			ls("\tReady to remove the middlest NFT.");
			const trnsObj = await msmFacade.removeMSMSubnNFT(midKey, opts);	
			if (trnsObj.logs[0] == undefined) {
				ls("\tNo matching NFT key was found in DApp state storage.");
				return;
			} 
			const  nftKey = trnsObj.logs[0].args.nftKey;
			const nftAddr = trnsObj.logs[0].args.nftAddr;
//				assert.equal(midKey, nftKey, "Calculated key value not equal to key of removed NFT.");
			ls("\tNFT# " + nftKey + " at " + nftAddr + " has been removed.");
			nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			midIndex = (nftCount / 2).toFixed(0);
			ls("\tAnd now there are  " + nftCount + " NFTs, and the index of the middlest is " + midIndex + ".");
		});	//*/	
/*		
		it(". . . removes the middle-most Subscription and its associated NFTs, if any.", async () => {	
			let opts = Object({ from: MSM_MANAGER });
			let sKs = await msmFacade.getAllMSMSubnKeys.call(opts);
			let count = sKs.length;
			const midIndex = (count / 2).toFixed(0);
			const midKey = sKs[midIndex];
			ls("\n\tTo begin there are " + count + " Subscriptions. \n\tThe index of the middlemost is " + midIndex + ".\n\tThe key of the middlemost " + midKey + ".\n\tThat Subscription will now be removed:");
			const trnsObj = await msmFacade.removeMSMSubscription(midKey, opts);
			assert.ok(trnsObj, "Unsuccessful call to removeMSMSubscription()");
			const numLogs = trnsObj.logs.length; 
			ls("\t" + numLogs + " log entries have been returned by removeMSMSubscription().");
			const lastLog = numLogs - 1;  
			const remKey = trnsObj.logs[lastLog].args.subnKey;
			ls("\tSubscription #" + remKey + " has been removed.");	
			sKs = await msmFacade.getAllMSMSubnKeys.call(opts);
			count = sKs.length;
			ls("\tNow there are " + count + " Subscriptions.");
		});	//*/
//*		
		it(". . . returns, again, a list of all Subscription keys, in rows of 5 items each:", async () => { 
			const sKs = await msmFacade.getAllMSMSubnKeys.call(opts); 
			ls("\n\tThere is a list of " + sKs.length + " Subscription keys that has been returned:");
			for (let i = 0; i < sKs.length; i += 5) {
				ls("\t\t" + i + ":\t" + sKs[i] + "\t" + sKs[i+1] + "\t" + sKs[i+2] + "\t" + sKs[i+3] + "\t" + sKs[i+4]);
			}
		});	//*/
//*		
		it(". . . returns, again, a list of all NFT keys, in rows of 5 items each:", async () => {
			const nKs = await msmFacade.getSubnNFTKeys.call(opts);
			ls("\n\tThere is a list of " + nKs.length + " NFT keys that has been returned:");
			for (let i = 0; i < nKs.length; i += 5) {
				ls("\t\t" + i + ":\t" + nKs[i] + "\t" + nKs[i+1] + "\t" + nKs[i+2] + "\t" + nKs[i+3] + "\t" + nKs[i+4]);
			}
		});	//*/
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});
	} catch (err) {
			ls('ERROR caught in MSMFacade tests:\n' + err);
	}	//	try-catch
});