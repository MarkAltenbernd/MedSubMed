//	Import deployed addresses of MSM contracts 
const { atMSMFacade } = require('./MSMDeployedAddresses.js');
const { atMSMKeys }   = require('./MSMDeployedAddresses.js');

const MSMKeys		 	= artifacts.require("MSMKeys");
const MSMFacade 	 	= artifacts.require("MSMFacade");
const Util1538		 	= artifacts.require("Util1538");
const UtilMSM		 	= artifacts.require("UtilMSM");
const MSMAdminUtils		= artifacts.require("MSMAdminUtils");
const MSMPublisher  	= artifacts.require("MSMPublisher");
const MSMSubscriber  	= artifacts.require("MSMSubscriber");
const MSMPublication 	= artifacts.require("MSMPublication");
const MSMSubscription 	= artifacts.require("MSMSubscription");
const MSMSubscriptUtils = artifacts.require("MSMSubscriptUtils");
const MSMSubnNFTUtils   = artifacts.require("MSMSubnNFTUtils");

require('dotenv').config();

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

contract('The MSMSubscription contract . . .', async (accounts) => { 
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	const opts = Object({from: MSM_MANAGER});
	
	let msmFacade, msmKeys;
	let facadeIdentity = "(Identity Unknown)";

	try { 
		it(". . . instantiates an MSMFacade contract object.", async () => { 
			ls("CONTRACT START:\t" + ts());
		
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMAdminUtils.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublisher.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriber.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublication.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscription.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriptUtils.abi); 
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubnNFTUtils.abi); 
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating an MSMFacade contract object.");
			const funcSig = "getFacadeIdentifiers()";	//	A function delegated from contract UtilMSM
			const itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	Function delegated  from UtilMSM required for following
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
		});
//*		
		it(". . . retrieves the current value of MSMKeys.key.", async () => {
			msmKeys = await MSMKeys.at(atMSMKeys, opts);
			assert.ok(msmKeys, "Failure instantiating msmKeys");
			const currKey   = await msmKeys.current.call();
			ls("\n\tThe current value of the global key variable: " + currKey);
		});	//*/
//*		
		it(". . . may begin with some registered Subscriptions.", async () => {
			const count = await msmFacade.getSubscriptionCount.call(opts);
			const subnCount = Number(count);
			ls("\n\tFacade " + facadeIdentity + " begins with " + count + " registered Subscritions:");
		});	//*/
/*		
		it(". . .  may have some Subscriptions (retrieved by a single call).", async () => {
			const msmSubns = await msmFacade.getAllMSMSubscriptions.call(opts);
			const subnCount = msmSubns.length; 
			ls("\n\tThere are " + subnCount + " Subscriptions retrieved in a single call:");
			if (subnCount == 0 ) return; 
			for (let i = 0; i < subnCount; i += 1) {
				const msmSubn = msmSubns[i]; 
				const subnKey  = msmSubn.subnKey;
				const nftCount = msmSubn.nftKeys.length;
				const subrAddr = msmSubn.subrAddress; 
				const pubnKey  = msmSubn.pubnKey;
				ls("\t\tSubscription #" + subnKey + " with " + nftCount + " NFTs: Publication #" + pubnKey + ": Subscriber " + subrAddr); 
			}
		});	//*/
/*		
		it(". . .  has the following Subscriptions (retrieved individually by index).",async  () => {
			const subnCount =  await msmFacade.getSubscriptionCount.call(opts);
			ls("\n\tThere are " + subnCount + " Subscriptions to be called individually by index:");
			if (subnCount == 0 ) return;
			for (let i = 0; i < subnCount; i += 1) {
				const msmSubn = await msmFacade.getMSMSubscriptionByIndex(i, opts);	
				const subnKey  = msmSubn.subnKey;
				const nftCount = msmSubn.nftKeys.length;
				const subrAddr = msmSubn.subrAddress; 
				const pubnKey  = msmSubn.pubnKey;
				ls("\t\tSubscription #" + subnKey + " with " + nftCount + " NFTs: Publication #" + pubnKey + ": Subscriber " + subrAddr); 
			}		
		});	//*/
/*		
		it(". . .  has the following Subscriptions (retrieved individually by subnKey).",async  () => {
			const subnCount =  await msmFacade.getSubscriptionCount.call(opts);
			ls("\n\tThere are " + subnCount + " Subscriptions to be called individually by key:");
			if (subnCount == 0 ) return;
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);			
			for (let i = 0; i < subnKeys.length; i += 1) {
				const msmSubn = await msmFacade.getMSMSubscriptionByKey(subnKeys[i], opts);	
				const subnKey  = msmSubn.subnKey;
				const nftCount = msmSubn.nftKeys.length;
				const subrAddr = msmSubn.subrAddress; 
				const pubnKey  = msmSubn.pubnKey;
				ls("\t\tSubscription #" + subnKey + " with " + nftCount + " NFTs: Publication #" + pubnKey + ": Subscriber " + subrAddr); 
			}		
		});	//*/
/*			
		it(". . . returns the number of Subscriptons for each Publisher.", async () => {
			const pubrAddrs = await msmFacade.getAllMSMPubrAddrs(opts);
			ls("\n\tRetrieving the number of Subscriptions for each of " + pubrAddrs.length + " Publishers:");
			for (let i = 0; i < pubrAddrs.length; i += 1) {
				const subnCount = await msmFacade.getPubrSubnCount(pubrAddrs[i], opts);
				ls("\t\t" + (i + 1) + ":\tPublisher " + pubrAddrs[i] + " has " +
					subnCount + " Subscriptions.");
			}
		});	//*/
/*		
		it(". . . returns the number of Subscriptions for each Subscriber.", async () => {
			const subrAddrs = await msmFacade.getAllMSMSubrAddrs(opts);
			ls("\n\tRetrieving the number of Subscriptions for each of " + subrAddrs.length + " Subscribers:");
			for (let i = 0; i < subrAddrs.length; i += 1) {
				const subnCount = await msmFacade.getSubrSubnCount(subrAddrs[i], opts); 
				ls("\t\t" + (i + 1) + ":\tSubscriber " + subrAddrs[i] + " has " +
					subnCount + " Subscriptions.");
			}
		});	//*/
/*
		it(". . . returns the number of Subscriptions for each Publication.", async () => { 
			const pubnKeys = await msmFacade.getAllMSMPubnKeys.call(opts);
			const pubnCount = pubnKeys.length;
			ls("\n\tRetrieving the number of Subscriptions for each of " + pubnCount + "  Publications.");
			for (let i = 0; i < pubnCount; i += 1) {
				const pubnKey = pubnKeys[i];
				const subnCount = await msmFacade.getPubnSubnCount(pubnKey); 
				ls("\t\t" + (i + 1) + ":\tThe number of Subscriptions for Publication " + pubnKey + " is " + subnCount);
			}
		});	//*/
//*
		it(". . . removes a single Subscription, given its key.", async () => {
			let subnCount = await msmFacade.getSubscriptionCount.call(opts);  
			if (subnCount == 0) { 
				ls("\n\tThere ain't no Subscriptions, so you can't, like, y'know, remove one. DUH!");
				return;
			}
			let nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			ls("\n\tWe begin with " + nftCount + " NFTs among all Subscriptions.");
			let subn     = await msmFacade.getMSMSubscriptionByIndex.call(0, opts);
			let nftKey   = subn.nftKeys[0]; 
			let nftProps = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts);			
			ls("\tThe properties for MSMSubscriptionNFT for the FIRST Subscription, #" + subn.subnKey + " are as follows:");	
			ls("\t\tName:\t\t" + nftProps['0']);
			ls("\t\tSymbol:\t\t" + nftProps['1']);
			ls("\t\tParent Key:\t" + nftProps['2']);
			ls("\t\tNFT Key:\t" + nftProps['3']);
			ls("\tWe start with " + subnCount + " Subscriptions and will remove the first.");
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			const subnKey = subnKeys[0]; 
			ls("\n\tRemoving Subscription #" + subnKey +":");
			const trnsObj = await msmFacade.removeMSMSubscription(subnKey); 
			const remKey = trnsObj.logs[1].args.subnKey; 
			ls("\tSubscription " + remKey + " has been removed.");
			const newCount = await msmFacade.getSubscriptionCount.call(opts); 
			ls("\tSo now we have just " + newCount + " Subscriptions remaining.");
			if (newCount == 0) { 
				ls("\n\tThere is nothing further to do.");
				return;
			}
			nftCount = await msmFacade.getMSMSubnNFTCount.call(opts);
			ls("\n\tWe end with " + nftCount + " NFTs among all Subscriptions.");
			subn     = await msmFacade.getMSMSubscriptionByIndex.call(0, opts);
			nftKey   = subn.nftKeys[0]; 
			nftProps = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts);			
			ls("\tThe properties for MSMSubscriptionNFT for the FIRST Subscription, #" + subn.subnKey + " are as follows:");	
			ls("\t\tName:\t\t" + nftProps['0']);
			ls("\t\tSymbol:\t\t" + nftProps['1']);
			ls("\t\tParent Key:\t" + nftProps['2']);
			ls("\t\tNFT Key:\t" + nftProps['3']);
		});	//*/
/*
		it(". . . removes all existing Subscriptions.", async () => 
			const oldSubnCount = Number(await msmFacade.getSubscriptionCount.call(opts));
			ls("\n\tThere are " + oldSubnCount + " Subscriptions that will be removed.");
			if (oldSubnCount == 0) return;
			const trnsObj = await msmFacade.removeAllMSMSubscriptions(opts);
			assert.ok(trnsObj, "Failure in removeAllMSMSubscriptions()");
			const removedCount = trnsObj.logs[0].args.numRemoved; 
			ls("\n\t   So now " + removedCount + " Subscriptions have been removed . . .");	
			const subnCount = Number(await msmFacade.getSubscriptionCount.call(opts));
			if (subnCount != 0) {
				ls("\t. . . BUT SOMETHING IS WRONG, because " + subnCount + " Subscriptions still remain!");
				return;
			} 
			ls("\t . . . and none remains (which is as it should be.)");			
		});		//*/
/*
		it(". . . adds one Subscription for the middle Publication and the middle Subscriber.", async () => { 
			const pubnCount = Number(await msmFacade.getPublicationCount.call(opts)); 
			assert.isAbove(pubnCount, 0, "There are no Publications.");
			const _pubnIndex = Math.round(pubnCount / 2); 	//	Point at middle Publication			
			const retPubn = await msmFacade.getMSMPublicationByIndex.call(_pubnIndex); 
			const _pubnKey = retPubn[0];
			const subrAddrs = await msmFacade.getActiveMSMSubrAddrs.call(opts); 
			assert.isAbove(subrAddrs.length, 0, "There are no Subscribers.");
			const _subrIndex = Math.round((subrAddrs.length / 2)); 	//	Point at middle Subscriber
			const _subrAddr = subrAddrs[_subrIndex]; 
			ls("\n\tPrior to call to addMSMSubscription():");
			ls("\t\tSubscriber address: " + _subrAddr);
			ls("\t\tPublication key;    " + _pubnKey); 
			
			const trnsObj = await msmFacade.addMSMSubscription(_subrAddr, _pubnKey, opts); 
			assert.ok(trnsObj, "Failure adding Subscription.");
			const subnKey = trnsObj.logs[1].args.subnKey;
			const nftKey = trnsObj.logs[1].args.nftKey;
			const subrAddr  = trnsObj.logs[1].args.subrAddr;
			const pubnTitle = trnsObj.logs[1].args.pubnTitle; 
			ls("\n\tSubscription #" +  subnKey + " added: '" + pubnTitle + "' for Subscriber " + subrAddr + " with NFT #" + nftKey + ".");
			const newOwner = trnsObj.logs[0].args.newOwner;
			const previousOwner = trnsObj.logs[0].args.previousOwner;
			ls("\t\tpreviousOwner =\t" + previousOwner + "\n\t\t     newOwner =\t" + newOwner);
		});	//*/
/*
		it(". . . adds several Subscriptions for various Subscribers and Publications", async () => { 
			const subrAddrs = await msmFacade.getAllMSMSubrAddrs(); 
			const pubnKeys = await msmFacade.getAllMSMPubnKeys();
			ls("\n\t'Bout to add 1 Subscription for each combination of " + subrAddrs.length + " Subscribers and " + pubnKeys.length + " Publications.");
			ls("\n\tAdding many Subscriptions:");
			let k = 0;
			for (let i = 0; i < subrAddrs.length; i += 1) {
				for (let j = 0; j < pubnKeys.length; j += 1) {
					const trnsObj = await msmFacade.addMSMSubscription(subrAddrs[i], pubnKeys[j], opts);
					k += 1;
					ls("\t\t" + k + ":\tSubscription #" + trnsObj.logs[1].args.subnKey + 
						" added:\t " + trnsObj.logs[1].args.pubnTitle + 
						" for Subscriber " + trnsObj.logs[1].args.subrAddr);
				}
			}
			ls("\t" + k + " added.");
		});	//*/	
/*
		it(". . . adds not more than a limited number of Subscriptions for various Subscribers and Publications", async () => { 
			const maxSubrs =  3;
			const maxSubns = 20;
			const subrAddrs = await msmFacade.getAllMSMSubrAddrs.call(opts); 
			const pubnKeys = await msmFacade.getAllMSMPubnKeys.call(opts);
			let subrLimit = subrAddrs.length;
			let pubnLimit = pubnKeys.length;
			if (subrLimit > maxSubrs) subrLimit = maxSubrs;
			const tmpLimit = maxSubns / subrLimit ;
			if (pubnLimit > tmpLimit) pubnLimit = tmpLimit;
			if (pubnLimit < 1.0) pubnlimit = 1;
			ls("\n\tAdding several Subscriptions:");
			let k = 0;
			for (let i = 0; i < subrLimit; i += 1) {
				for (let j = 0; j < pubnLimit; j += 1) {
					const trnsObj = await msmFacade.addMSMSubscription(subrAddrs[i], pubnKeys[j], opts);
					k += 1;
					ls("\t\t" + k + ":\tSubscription #" + trnsObj.logs[1].args.subnKey + 
						" added:\n\t\t\t " + trnsObj.logs[1].args.pubnTitle + 
						"\n\t\t\tfor Subscriber " + trnsObj.logs[1].args.subrAddr);
					const newOwner = trnsObj.logs[0].args.newOwner;
					const previousOwner = trnsObj.logs[0].args.previousOwner;
					ls("\t\t\tpreviousOwner =\t" + previousOwner + "\n\t\t\t     newOwner =\t" + newOwner);
				}
			}
			ls("\t" + k + " added.");
		});	//*/	
/*
		it(". . . retrieves a list of ALL MSMSubscription keys.", async () => {
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			ls("\n\tRetrieving a list of all " + subnKeys.length + " Subscription keys:");
			for (let i = 0; i < subnKeys.length; i += 1) {
				ls("\t\t" + (i + 1) + ":\t" + subnKeys[i]);
			}
		});	//*/
/*
		it(". . . retrieves a list of ALL NFT keys.", async () => {
			const nftCount = await msmFacade.getMSMSubnNFTCount.call(opts); 
			const nftKeys  = await msmFacade.getSubnNFTKeys.call(opts);
			assert.equal(nftCount, nftKeys.length, "Count mismatch between nftCount and nftKeys.length."); 
			ls("\n\tRetrieving a list of all " + nftCount + " NFT keys:");
			for (let i = 0; i < nftCount; i += 1) { 
				ls("\t\t" + (i + 1) + ": \t" + nftKeys[i]);
				} 
		});
/*		
		it(". . . returns the address of an NFT for a specified NFT key value.", async () => {
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			if (subnKeys.length = 0) {
				ls("\n\tThere are no Subscriptions.");
				return;
			}
			const subn = await msmFacade.getMSMSubscriptionByIndex.call(0, opts);	//	Get first Subn
			if (subn.nftKeys.length == 0) {
				ls"(\n\tThe first Subscription has no NFTs.");
				return;
			}
			const nftKey = subn.nftKeys[0];	//	Get first (and probably only) NFT key
			const nftAddr  = await msmFacade.getMSMSubnNFTAddr.call(nftKey, opts);
				ls("\n\tThe first Subscription - "  + subn.subnKey + " - has this associated NFT address: " + nftAddr);	
		});	//*/
/*
		it(". . . returns the NFT contract instance for a specified NFT key value.", async () => { 
			ls("");		//	For debugging aesthetics, force a newline
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			if (subnKeys.length == 0) {
				ls("\t\nThere are no Subscriptions.");
				return;
			}
			const subnKey  = subnKeys[0];
			ls("\tsubnKey=" + subnKey);
			const subn = await msmFacade.getMSMSubscriptionByKey.call(subnKey, opts);	
			if (subn.nftKeys.length == 0) {
				ls"(\n\tThe first Subscription has no NFTs.");
				return;
			}
			const nftKey = subn.nftKeys[0];	//	Get first (and probably only) NFT key
			ls("\t nftKey=" + nftKey);
			const nft_ = await msmFacade.getMSMSubnNFT.call(nftKey, opts);
			ls("\n\tThe first NFT for the Subscription " + subnKey + " is of type " + typeof nft_ + ", to wit:\n\t\t>>" + nft_ + "<<");
					
		});	//*/
/*
		it(". . . returns the NFT's properties for a specified NFT key value.", async () => {
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			if (subnKeys.length = 0) {
				ls("\n\there are no SubscriptionNFTs.");
				return;
			}
			const subn = await msmFacade.getMSMSubscriptionByIndex.call(0, opts);	//	Get first Subn
			if (subn.nftKeys.length == 0) {
				ls("\n\tTthe first Subscription has no associated NFTs.");
				return;
			}
			const nftKey = subn.nftKeys[0];	//	Get first (and probably only) NFT key 
			const nftProps = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts);			
			ls("\n\tThe properties for first MSMSubscriptionNFT for the first Subscription, #" + subn.subnKey + " are as follows:");	
			ls("\t\tName:\t\t" + nftProps['0']);
			ls("\t\tSymbol:\t\t" + nftProps['1']);
			ls("\t\tParent Key:\t" + nftProps['2']);
			ls("\t\tNFT Key:\t" + nftProps['3']);
			
		});	//*/
/*
		it(". . . returns the addresses of NFTs as specified by NFT key values.", async () => {
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			const keysLen = subnKeys.length;
			if (keysLen == 0) {
				ls("\n\tThere are no Subscriptions to have their NFT addresses listed.")
				return;
			}
			ls("\n\tSubscriptions and the addresses of their associated NFTs:");
			for (let i = 0; i < keysLen; i += 1) {
				const subn = await msmFacade.getMSMSubscriptionByKey(subnKeys[i], opts);
				const nftKeys = subn.nftKeys;
				if (nftKeys.length == 0) {
					ls("\n\nSubscription " + subnKeys[i] + " has no associated NFTs.");
					continue;			//	the for loop with the next subnKey
				}
				for (let j = 0; j < nftKeys.length; j += 1) {
					const nftKey = nftKeys[j];
					const nftAddr = await msmFacade.getMSMSubnNFTAddr.call(nftKey, opts);
					ls("\t\tSubscription " + subnKeys[i] + " has this NFTAddress: " + nftAddr);
				}
			}
		});	//*/
/*
		it(". . . returns the properties of the first Subscription's first NFT token.", async () => {
			const subnCount = await msmFacade.getSubscriptionCount.call(opts); 
			if (subnCount == 0) {
				ls("\n\tThere are no Subscriptions.");
				return;
			}
			const subn     = await msmFacade.getMSMSubscriptionByIndex.call(0, opts);
			if(subn.nftKeys.length == 0) {
					ls("\n\tThe first Subscription has no NFTs.");
					return;
			}
			const nftKey   = subn.nftKeys[0]; 
			const nftProps = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts);			
			ls("\n\tThe properties for MSMSubscriptionNFT for Subscription #" + subn.subnKey + " are as follows:");	
			ls("\t\tName:\t\t" + nftProps['0']);
			ls("\t\tSymbol:\t\t" + nftProps['1']);
			ls("\t\tParent Key:\t" + nftProps['2']);
			ls("\t\tNFT Key:\t" + nftProps['3']);
		});	//*/
/*
		it(". . . marks some Subsciptions as not active (requires more than 12 registered Subscriptions).", async () => {
			const subnKeys = await msmFacade.getAllMSMSubnKeys(opts);
			const subnCount = subnKeys.length;
			ls("\n\tMarking a bunch of Subscriptions as not active:");
			let j = 0;
			for (let i = 1; i < subnCount; i += 3) { 
				const subnKey = subnKeys[i];
				await msmFacade.deactivateMSMSubscription(subnKey, opts);
				j += 1;
			}
			ls("\t\t" + j + " Subscriptions have been deactivated.");			
		});	//*/
/*
		it(". . . finds all INACTIVE Subscriptions and marks them as ACTIVE.", async () => { 
			const subnKeys = await msmFacade.getAllMSMSubnKeys.call(opts);
			const subnCount = subnKeys.length;
			if (subnCount == 0) {
				ls("\n\tThere are no Subscriptions, active or otherwise.");
				return;
			}
			let j = 0;
			for (let i = 0; i < subnCount; i += 1) { 
				const subn = await msmFacade.getMSMSubscriptionByIndex(i);
				if (subn.subnActive == false) { 
					await msmFacade.activateMSMSubscription(subnKeys[i], opts);
					j += 1;
				}
			}
			ls("\n\tOf " + subnCount + " Subscriptions, " + j + " were inactive but have been reactivated."); 
			});	//*/
/*
		it(". . . retrieves a list of only ACTIVE MSMSubscription keys.", async () => { 
			const subnKeys = await msmFacade.getActiveMSMSubnKeys(opts);
			if (subnKeys.length == 0) {
				ls("\n\tThere are no active Subscriptions.");
				return;
			}
			ls("\n\tRetrieving a list of " + subnKeys.length + " ACTIVE MSMSubscription keys.");
			for (let i = 0; i < subnKeys.length; i += 1) {
				ls("\t\t" + (i + 1) + ":\t" + subnKeys[i]);
			}
		});	//*/
/*		
		it(". . . retrieves the current value of global Key.", async () => {
			msmKeys = await MSMKeys.at(atMSMKeys, opts);
			assert.ok(msmKeys, "Failure instantiating msmKeys");
			const currKey   = await msmKeys.current.call();
			ls("\n\tThe current value of the global Key variable: " + currKey);
		});	//*/
//*
		it(" . . . terminates.", async () => { 
			const count = await msmFacade.getSubscriptionCount.call(opts);
			ls("\n\tFacade " + facadeIdentity + " ends with " + count + " registered Subscriptions");
			ls("CONTRACT END:\t" + ts());
		});	//*/
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});