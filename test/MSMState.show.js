
//	Import deployed addresses of MSM contracts 
const { atMSMFacade } = require('./MSMDeployedAddresses.js');
const { atMSMKeys }   = require('./MSMDeployedAddresses.js');

//
const MedSubMed 			= artifacts.require("MedSubMed");
const MSMFacade 			= artifacts.require("MSMFacade");
const Util1538				= artifacts.require("Util1538");
const UtilMSM 				= artifacts.require("UtilMSM");
const MSMKeys				= artifacts.require("MSMKeys");
const MSMManager			= artifacts.require("MSMManager");
const MSMPublisher			= artifacts.require("MSMPublisher");
const MSMSubscriber			= artifacts.require("MSMSubscriber");
const MSMPublication		= artifacts.require("MSMPublication");
const MSMSubscription		= artifacts.require("MSMSubscription");	
const MSMSubscriptUtils		= artifacts.require("MSMSubscriptUtils");	
const MSMSubnNFTUtils		= artifacts.require("MSMSubnNFTUtils");	

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//	Enable one of following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSM state variables . . .', async (accounts) => {
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	All functions will be called at the highest privelege level
	const opts = Object({from: MSM_OWNER});
	
	let msmFacade, msmKeys;
	let facadeIdentity = "(Identity Unknown)";
	
	try {
		it(". . . instantiates the Facade and MSMKeys contracts, obtains Facade's identity.", async () => {
			//	First concatenate delegate ABIs to that of Facade
			MSMFacade.abi = MSMFacade.abi.concat(MedSubMed.abi);
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMManager.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublisher.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriber.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMPublication.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscription.abi);	
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubscriptUtils.abi);
			MSMFacade.abi = MSMFacade.abi.concat(MSMSubnNFTUtils.abi);	
			
			//	Instantiate the facade and the keys
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "Failure instantiating MSMFacade.");
			msmKeys = await MSMKeys.at(atMSMKeys, opts);
			assert.ok(msmKeys, "Failure instantiating msmKeys");
			//	Get the Facade's unique identity
			let funcSig = "getFacadeIdentifiers()"; 
			//	funtionExists() must have been delegated from Util1538
			let itExists = await msmFacade.functionExists.call(funcSig, opts);
			if (itExists) { //	getFacadeIdentifiers() must have been delegated from UtilMSM 
				const facIDs = await msmFacade.getFacadeIdentifiers.call(opts);
				facadeIdentity = "#" + facIDs[0].toString() + "-" + facIDs[1].toString();	
			}	
		});
//*		
		it(". . . has a number of Facade-level state variables.", async () => {
			ls("\nCONTRACT START:\t" + ts() + " for Facade " + facadeIdentity);
			ls("\n\tMSM State Variables\n============================================");
			const factoryID = await msmFacade.getFactoryID.call(opts);
			ls("\t              Factory ID:\t" + factoryID);
			const facadeSeqNum = await msmFacade.getFacadeSequenceNumber.call(opts); 
			ls("\t  Facade Sequence Number:\t" + facadeSeqNum);
			ls("\t         Facade Identity:\t" + facadeIdentity);
			const currKey   = await msmKeys.current.call(opts);
			ls("\tCurrent global key value:\t" + currKey);
			const totalFunctions = await msmFacade.totalFunctions.call(opts); 
			ls("\t     Delegated functions:\t" + totalFunctions);
			const msgSender = await msmFacade.getMsgSender.call(opts);
			ls("\t              msg.sender:\t" + msgSender);
			const txOrigin  = await msmFacade.getTxOrigin.call(opts);
			ls("\t               tx.origin:\t" + txOrigin);
			const msmOwner  = await msmFacade.getMSMOwner.call(opts);
			ls("\t       Application Owner:\t" + msmOwner);	
			const version   = await msmFacade.getMSMVersion.call(opts);
			ls("\t     Application Version:\t'" + version + "'");
			const title     = await msmFacade.getMSMTitle.call(opts);
			ls("\t       Application Title:\t'" + title + "'");
			const desc      = await msmFacade.getMSMDescription.call(opts);
			ls("\t Application Description:\t'" + desc + "'");
			const numMngrs = await msmFacade.getMSMManagerCount.call(opts);
			ls("\t     Registered Managers:\t" + numMngrs);
			const mngrs = await msmFacade.getActiveMSMManagers.call(opts);
			const activeMngrs = mngrs.length; 
			ls("\tThere are " + activeMngrs + " Active Managers, to wit:"); 
			for (let i = 0; i < accounts.length; i += 1) { 
				const retBool = await msmFacade.isManager.call(accounts[i], opts);
				if (retBool) {
					ls("\t\taccounts[" + i + "]: " + accounts[i] + " is a Manager");
				}
			}
			ls("\tCounts of MSM contract instances:");
			const pubrCount = await msmFacade.getMSMPublisherCount.call(opts);
			ls("\t   Registered Publishers:\t" + pubrCount);
			const subrCount = await msmFacade.getMSMSubscriberCount.call(opts);
			ls("\t  Registered Subscribers:\t" + subrCount);	
			const pubnCount = await msmFacade.getPublicationCount.call(opts);
			ls("\t Registered Publications:\t" + pubnCount);	
			const subnCount =  await msmFacade.getSubscriptionCount.call(opts);
			ls("\tRegistered Subscriptions:\t" + subnCount);	
			const nftCount  = await msmFacade.getMSMSubnNFTCount.call(opts);
			ls("\t       Subscription NFTs:\t" + nftCount);		
		});	//*/
			
//*	Publishers
		it(". . . may have registered Publishers, some of whom may be active.", async () => { 
			const pubrCount = await msmFacade.getMSMPublisherCount.call(opts);
			ls("\n\tTotal number of Publishers:\t" + pubrCount);
			if (pubrCount > 0) {
				ls("\tACTIVE Publishers:");
				const pubrs = await msmFacade.getActiveMSMPublishers.call(opts);
				const pubrNames = pubrs[0];
				const pubrAddrs = pubrs[1];
				const numPubrs = pubrNames.length;
				if (numPubrs > 0) {
					for (let i = 0; i < numPubrs; i += 1) {
						ls("\t\t" + pubrAddrs[i] + "  - -  " + pubrNames[i]);
					}	
				}
				const allPubrAddrs = await msmFacade.getAllMSMPubrAddrs.call(opts);
				const pubrLen = allPubrAddrs.length;
				ls("\tALL " + pubrLen + " Publishers, regardless of active status:");
				for (let i = 0; i < pubrLen; i += 1) {
					ls("\t\t" + i + ":\t" + allPubrAddrs[i]);
				}
			}
		});	//*/
//*	Subscribers
		it(". . . may have registered Subscribers, some of whom may be active.", async () => { 		
			const subrCount = await msmFacade.getMSMSubscriberCount.call(opts);
			ls("\n\tTotal number of Subscribers:\t" + subrCount);
			if (subrCount > 0) {
				const subrs = await msmFacade.getActiveMSMSubrAddrs.call(opts);
				const numSubrs = subrs.length;
				ls("\tNumber of Active Subscribers:\t" + numSubrs);
				for (let i = 0; i < numSubrs; i += 1) {
					ls("\t\t" + i + ":\t" + subrs[i]);
				}
			}
		});	//*/
//*	Publications
		it(". . . may have Publications from registered Publishers.", async () => { 
			const pubnCount = await msmFacade.getPublicationCount.call(opts);
			ls("\n\tThere are " + pubnCount + " registered Publications:");
			for (let i = 0; i < pubnCount; i += 1) {
				const ret = await msmFacade.getMSMPublicationByIndex(i, opts);
				ls("\t\tPublication # " + ret[0] + ":\t" + ret[1] + "\tfrom Publisher @ " + ret[3]);
			}	
		});	//*/
//*	Subscriptions			
		it(". . . may have Subscriptions that relate Subscribers to Publications.", async () => { 
			const subnCount =  await msmFacade.getSubscriptionCount.call(opts);
			ls("\n\tThere are " + subnCount + " Subscriptions currently on file.");
			if (subnCount > 0) {
				for (let i = 0; i < subnCount; i += 1) {
					const msmSubn = await msmFacade.getMSMSubscriptionByIndex(i, opts);	
					const subnKey  = msmSubn.subnKey;
					const subrAddr = msmSubn.subrAddress; 
					const pubnKey  = msmSubn.pubnKey;
					const nftKeys = msmSubn.nftKeys;
					ls("\t" + (i + 1) + ":\tSubscription #" + subnKey + " is to Publication #" + pubnKey + " for Subscriber " + subrAddr); 
					ls("\t\t\tThis Subscription has " + nftKeys.length + " NFTs.");
					for (let j = 0; j < nftKeys.length; j += 1) {
						const nftKey = nftKeys[j];
						const props  = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts); 
						if (props[1] == "Missing NFT") { 
							ls("\t\t\t\tThe NFT with key " + nftKey + " does not exist.");
							continue;
						}
						const name   = props[0];
						const symbol = props[1];
						const parentKey = props[2];
						const nftkey = props[3];
						ls("\t\t\t\tNFT: name='" + name + "'; symbol='" + symbol + "'; parentKey=" + parentKey + "; nftKey=" + nftKey); 
					} 					
				}	
			}
		});	//*/
//*
//	NFTs for each Subscription for each Subscriber
		it(". . . may have Subscribers that have Subscriptions that have NFTs.", async () => { 	
			const subrCount = await msmFacade.getMSMSubscriberCount.call(opts);
			ls("\n\tNumber of Subscribers:\t" + subrCount);
			if (subrCount > 0) {
				ls("\tActive Subscribers:");
				const subrAddrs = await msmFacade.getActiveMSMSubrAddrs.call(opts);
				const numSubrs = subrAddrs.length;
				for (let i = 0; i < numSubrs; i += 1) { 
					const subrAddr = subrAddrs[i]; 
					const subr = await msmFacade.getMSMSubscriber.call(subrAddr, opts);
					ls("\tSubscriber:\t"+ subrAddr);
					const subnKeys = subr[2];
					for (let j = 0; j < subnKeys.length; j += 1) {
						const subnKey = subnKeys[j];
						const msmSubn = await msmFacade.getMSMSubscriptionByKey.call(subnKey, opts);
						ls("\t\tSubscription:\t" + subnKey);
						const nftKeys = msmSubn.nftKeys;
						for (let k = 0; k < nftKeys.length; k += 1) {
							const nftKey = nftKeys[k];
							const props  = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts); 
							const name   = props[0];
							const symbol = props[1];
							const parentKey = props[2];
							const nftkey = props[3];
							ls("\t\t\tNFT: name='" + name + "'; parentKey=" + parentKey + "; nftKey=" + nftKey);
						}
					}
				}
			}
		
		});	//*/
//*
//	NFTs for each Subscription for each Publication for each Publisher
		it(". . . may have Publishers that have Publications that have Subscriptions that have NFTs.", async () => { 	
			const pubrCount = await msmFacade.getMSMPublisherCount.call(opts);
			ls("\n\tNumber of Publishers:\t" + pubrCount);
			if (pubrCount > 0) {
				ls("\tActive Publishers:");
				const pubrAddrs = await msmFacade.getActiveMSMPubrAddrs.call(opts);
				const numPubrs = pubrAddrs.length;
				for (let i = 0; i < numPubrs; i += 1) { 
					const pubrAddr = pubrAddrs[i]; 
					const pubr = await msmFacade.getMSMPublisher.call(pubrAddr, opts);
					ls("\tPublisher:\t"+ pubr[1]);
					const pubnKeys = pubr[3];
					const numPubns = pubnKeys.length;
					for (let j = 0; j < pubnKeys.length; j += 1) {
						const pubnKey = pubnKeys[j];
						const pubn = await msmFacade.getMSMPublicationByKey.call(pubnKey, opts);
						ls("\t\tPublication #" + pubn[0] + ":\t'" + pubn[1] +"'");
						const subnKeys = await msmFacade.getMSMPublicationSubscriptions.call(pubnKey, opts);
						for (let k = 0; k < subnKeys.length; k += 1) {
							const subnKey = subnKeys[k];
							const msmSubn = await msmFacade.getMSMSubscriptionByKey.call(subnKey, opts);
							ls("\t\t\tSubscription:\t" + subnKey);
							const nftKeys = msmSubn.nftKeys;
							for (let l = 0; l < nftKeys.length; l += 1) {
								const nftKey = nftKeys[l];
								const props  = await msmFacade.getMSMSubnNFTProps.call(nftKey, opts); 
								const name   = props[0];
								const symbol = props[1];
								const parentKey = props[2];
								const nftkey = props[3];
								ls("\t\t\t\tNFT: name='" + name + "'; parentKey=" + parentKey + "; nftKey=" + nftKey);
							}
						}
					}
				}
			}
		});	//*/
/*		//	Yet to be implemented	
			ls("\n\tmediaListCount:\t\t" + await msmFacade.mediaListCount.call(opts));
			ls("\n\tviewRequestedCount:\t" + await msmFacade.viewRequestedCount.call(opts));
			ls("\n\tviewGrantedCount:\t" + await msmFacade.viewGrantedCount.call(opts));
//*/			
		it(" . . . terminates.", () => { 
			ls("\nCONTRACT END:\t" + ts() + " for Facade " + facadeIdentity);
		});
	} catch {
		ls("Ooops! Caught!");
	}	
});