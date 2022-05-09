//	SPDX-License-Identifier: UNLICENSED
//	2022-01-13
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
	
import "./MSMModifiers.sol";	
import "./Uint2String.sol";
import "./MSMSubscription.sol";

interface IMSMAdminUtils { 
	function setMSMOwner(address _newOwner) external returns (bool);
	function setMSMVersion(string calldata _version) external;
	function setMSMTitle(string calldata _title) external;
	function setMSMDescription(string calldata _desc) external;
	function removeMSMManager(address) external; 
	function removeFromPubrMap(address _pubrAddr) external;
	function deactivateMSMPublisher(address _pubrAddr) external;
	function removeMSMPublisher(address _pubrAddr) external;
	function removeAllMSMPublishers() external;
	function removeFromSubrMap(address _subrAddr) external;
	function removeMSMSubscriber(address _subrAddr) external;
	function removeAllMSMSubscribers() external;
	function removeAllMSMPublications() external;
	function removeAllMSMSubscriptions() external;  
	function removeMSMPublication(uint256 _pubnKey) external;
	function removeMSMSubscription(uint256 _subnKey) external; 
	function removeMSMSubnNFT(uint256 _nftKey) external; 
	function removeAllMSMSubnNFTs() external; 
}

contract MSMAdminUtils is IMSMAdminUtils, MSMModifiers {	
	using Uint2String for uint256;
	
	event MSMPublisherDeactivated(address indexed pubrAddress, string pubrName);
	event MSMManagerRemoved(address mngrAddress, uint256 position);
	event MSMPublisherRemoved(address indexed pubrAddress, string pubrName, uint256 position);
	event popped(string msg, uint256 index);
	event MSMSubscriberRemoved(address indexed subrAddress, uint256 position); 	
	event MSMPublicationsCounted(string countMsg, uint256 numPubrs);
	event MSMPubrPubnsRemoved(string msg, uint256 limit);
	event MSMPublicationRemoved(uint256 indexed pubnKey); 
	event MSMPublicationsRemoved(string msg, uint256 limit);
	event MSMSubscriptionRemoved(uint256 indexed subnKey); 
	event MSMSubscriptionsRemoved(uint256 numRemoved);
	event msmSubnNFTRemoved(uint256 indexed nftKey, address indexed nftAddr);
	
	function setMSMOwner(address _newOwner) override external ownerOnly returns(bool) {
		bool success_ = false;
		require(sm.mngrMap[_newOwner].mngrActive, "New Owner must first be a Manager");
		sm.msmOwner = payable(_newOwner);
		success_ = true;
		return success_;
	}
	function setMSMVersion(string calldata _version) override external ownerOnly {
		sm.msmVersion = _version;
	}	
	function setMSMTitle(string calldata _title) override external managerOnly {
		sm.msmTitle = _title;
	}
	function setMSMDescription(string calldata _desc) override external managerOnly {
		sm.msmDescription = _desc;
	}
	function removeMSMManager(address _mngrAddress) override external managerOnly {
		address payable mngrAddress = payable(_mngrAddress);
		delete sm.mngrMap[mngrAddress];	
		for (uint i = 0; i < sm.mngrAddrs.length; i += 1) {	//	Scan the address array
			if (mngrAddress == sm.mngrAddrs[i]) {			//	if a match is found...
				delete sm.mngrAddrs[i];						//. . . zero the cell . . . 
				uint256 position = i;					
				for (; i < sm.mngrAddrs.length - 1; i += 1) {	//. . . move all subsequent . . .
					sm.mngrAddrs[i] = sm.mngrAddrs[i + 1];	//. . . items up one slot . . .
				}
				sm.mngrAddrs.pop();							//. . . get rid of last item.
				emit MSMManagerRemoved(mngrAddress, position);
			}
		}	
	}	
	function removeFromPubrMap(address _pubrAddr) override external managerOnly {
		delete sm.pubrMap[_pubrAddr];
	}
	function deactivateMSMPublisher(address _pubrAddr) override external managerOnly {
		Publisher memory pubr = sm.pubrMap[_pubrAddr];
		string memory pubrName = pubr.pubrName;
		pubr.pubrActive = false;
		sm.pubrMap[_pubrAddr] = pubr;
		emit MSMPublisherDeactivated(_pubrAddr, pubrName);
	}
	function removeMSMPublisher(address _pubrAddr) override external managerOnly {
		address payable pubrAddr = payable(_pubrAddr);
		Publisher memory pubr = sm.pubrMap[pubrAddr];		//	To populate event
		
		uint256 position = 0; 
		delete sm.pubrMap[pubrAddr];						//	Zero out its mapping entry
		uint256 deletions = 0;
		uint256 limit = sm.pubrAddrs.length;
		for (uint256 i = 0; i < limit; i += 1) {			//	Zero cell to be removed
			if (sm.pubrAddrs[i] == pubrAddr) {				//	if a match is found...
				delete sm.pubrAddrs[i];						//	...zero the cell
				position = i;								//	For emitting an event
			}
		}
		for (uint256 i = 0; i < limit; i += 1) {			//	Move up to fill gaps
			while (sm.pubrAddrs[i] == address(0x0)) { 		//	Consecutive deletions
				deletions += 1;								//	Count it
				sm.pubrAddrs[i] = payable(address(0x99999));
				uint256 j = i;
				for (; j < limit - 1; j += 1) {				//	Move subsequent . . . 
					sm.pubrAddrs[j] =sm.pubrAddrs[j + 1];	//	. . . cells up one
				}	//*/
			}
		}
		for (uint256 i = 0; i < deletions; i += 1) {
			sm.pubrAddrs.pop();								//	Remove now-superfluous cells
		}	
		emit MSMPublisherRemoved(pubrAddr, pubr.pubrName, position);
	}	//	removeMSMPublisher()
	function removeAllMSMPublishers() override external ownerOnly { 
		//	Admin/test only. In the real world, "removing" a Publisher requires removing
		//	all related Publications and all related Subscriptions, including for Subscribers,
		//	and also removing all related SubscriptionNFTs. 
		uint256 limit = sm.pubrAddrs.length;
		for (uint256 i = 0; i < limit; i += 1) {
			address payable pubrAddr = sm.pubrAddrs[i];
			delete sm.pubrMap[pubrAddr];
		}
		for (uint256 i = 0; i < limit; i += 1) {
			sm.pubrAddrs.pop();
			emit popped("Publisher popped from ", i);			
		}
	}	//	removeAllMSMPublishers()
	function removeFromSubrMap(address _subrAddr) override external managerOnly {
		delete sm.subrMap[_subrAddr];
	}
	function removeMSMSubscriber(address _subrAddr) override external managerOnly {
		address payable subrAddr = payable(_subrAddr);
		uint256 position = 0; 
		delete sm.subrMap[subrAddr];						//	Zero its mapping entry
		uint256 deletions = 0;
		uint256 limit = sm.subrAddrs.length;
		for (uint256 i = 0; i < limit; i += 1) {			//	Zero cell to be removed
			if (sm.subrAddrs[i] == subrAddr) {				//	if a match is found...
				delete sm.subrAddrs[i];						//	...zero the cell
				position = i;								//	For emitting an event
			}
		}
		for (uint256 i = 0; i < limit; i += 1) {			//	Move up to fill gaps
			while (sm.subrAddrs[i] == address(0x0)) { 		//	For consecutive deletions
				deletions += 1;								//	Count it
				sm.subrAddrs[i] = payable(address(0x99999));
				uint256 j = i;
				for (; j < limit - 1; j += 1) {				//	Move subsequent . . . 
					sm.subrAddrs[j] = sm.subrAddrs[j + 1];	//	. . . cells up one
				}	
			}
		}
		for (uint256 i = 0; i < deletions; i += 1) {
			sm.subrAddrs.pop();								//	Remove now-superfluous cells
		}	
		if (deletions > 0) {
			emit MSMSubscriberRemoved(subrAddr, position);
		}
	}	//	removeMSMSubscriber()
	function removeAllMSMSubscribers() override external ownerOnly {
		uint256 limit = sm.subrAddrs.length;
		for (uint256 i = 0; i < limit; i += 1) {
			address payable subrAddr = sm.subrAddrs[i];
			delete sm.subrMap[subrAddr];
		}
		delete sm.subrAddrs;
	}	//	removeAllMSMSubscribers()
	function removeAllMSMPublications() override external ownerOnly {
		//	Delete list of Publications for each known Publisher
		uint256 numPubrs = sm.pubrAddrs.length;
		string memory countMsg = "Count of Addresses in pubrAddrs: ";
		emit MSMPublicationsCounted(countMsg, numPubrs);
		for (uint256 i = 0; i < numPubrs; i += 1) {
			address pubrAddr = sm.pubrAddrs[i];
			Publisher memory oldPubr = sm.pubrMap[pubrAddr];
			Publisher memory newPubr;
			newPubr.pubrAddress = oldPubr.pubrAddress;
			newPubr.pubrName = oldPubr.pubrName;
			newPubr.pubrActive = oldPubr.pubrActive;
			uint256[] memory pubnKeys = new uint256[](0);
			newPubr.pubnKeys = pubnKeys;	
			sm.pubrMap[pubrAddr] = newPubr;
		}	
		string memory popMsg = "Publications removed for this many Publishers: ";
		emit MSMPubrPubnsRemoved(popMsg, numPubrs);
		
		uint256 numPubns = sm.pubnKeys.length;
		//	Return everything in the Publication mapping to default values
		for (uint256 i = 0; i < numPubns; i += 1) {
			uint256 pubnKey = sm.pubnKeys[i];
			delete sm.pubnMap[pubnKey];
		}
		popMsg = "All Publications removed from global state mapping: ";
		emit MSMPublicationsRemoved(popMsg, numPubns);
		
		//	Remove everything from the shadow array
		for (uint256 i = 0; i < numPubns; i += 1) {
			sm.pubnKeys.pop();
		}		
	}
	function removeAllMSMSubscriptions() override external ownerOnly { 
		//	Use judiciously, only for admin and testing - 
		//	this can do grevious damage to your data
		
		//	Clear all Subscriber.subnKeys[] arrays
		uint256 numSubrs = sm.subrAddrs.length;
		for (uint256 i = 0; i < numSubrs; i += 1) {
			address payable subrAddr = sm.subrAddrs[i];
			Subscriber memory oldSubr = sm.subrMap[subrAddr];
			Subscriber memory newSubr; 
			newSubr.subrAddress = subrAddr;
			newSubr.subrActive = oldSubr.subrActive;
			sm.subrMap[subrAddr] = newSubr;
		}		
		//	Clear all Publication.subnKeys[] arrays
		uint256 numPubns = sm.pubnKeys.length;
		for (uint256 i = 0; i < numPubns; i += 1) {
			uint256 pubnKey = sm.pubnKeys[i];
			Publication memory oldPubn = sm.pubnMap[pubnKey];
			Publication memory newPubn;
			newPubn.pubnKey = oldPubn.pubnKey;
			newPubn.pubrAddress = oldPubn.pubrAddress;
			newPubn.pubnTitle = oldPubn.pubnTitle;
			newPubn.pubnDescription = oldPubn.pubnDescription;
			newPubn.term = oldPubn.term;
			newPubn.rentalPrice = oldPubn.rentalPrice;
			newPubn.purchasePrice = oldPubn.purchasePrice;
			newPubn.pubnActive = oldPubn.pubnActive;
			sm.pubnMap[pubnKey] = newPubn;
		}
		uint256 numSubns = sm.subnKeys.length;
		//	Clear global Subscription mapping	
		for (uint256 i = 0; i < numSubns; i += 1) {
			uint256 subnKey = sm.subnKeys[i];
			delete sm.subnMap[subnKey];
		}
		delete sm.subnKeys;		//	Clear out the shadow array
		//	Clear global NFT-related variables
		for (uint256 i = 0; i < sm.nftKeys.length; i += 1) {
			uint256 nftKey = sm.nftKeys[i];
			address nftAddress = sm.nftAddrs[nftKey];
			delete sm.nftMap[nftAddress];
			delete sm.nftAddrs[nftKey];
		}
		delete sm.nftKeys;		//	Clear out the shadow array	
		emit MSMSubscriptionsRemoved(numSubns); 		
	}	//	removeAllMSMSubscriptions()
	function removeMSMPublication(uint256 _pubnKey) override external ownerOnly { 
		require(_pubnKey != 0, "Invalid key argument sent to removeMSMPublication().");
		Publication memory pubn = sm.pubnMap[_pubnKey];
		uint256 subnCount = pubn.subnKeys.length;
		for (uint256 i = 0; i < subnCount; i += 1) {
			uint256 subnKey = pubn.subnKeys[i];
			this.removeMSMSubscription(subnKey);
		}
		delete sm.pubnMap[_pubnKey];		
		emit MSMPublicationRemoved(_pubnKey); 
	}	//	removeMSMPublication() 
	function removeMSMSubscription(uint256 _subnKey) override external managerOnly { 
		require(_subnKey != 0, "Invalid key argument sent to removeMSMSubscription().");
		Subscription memory subn = sm.subnMap[_subnKey];
		uint256 nftCount = subn.nftKeys.length;
		for (uint256 i = 0; i < nftCount; i += 1) {
			uint256 nftKey = subn.nftKeys[i]; 
			this.removeMSMSubnNFT(nftKey);
		}
		delete sm.subnMap[_subnKey];
		//	Find (the only) matching cell
		uint256 limit 	 = sm.subnKeys.length;
		for (uint256 i = 0; i < limit; i += 1) {
			if (sm.subnKeys[i] == _subnKey) { 
				sm.subnKeys[i] = sm.subnKeys[limit - 1];//	Replace with last element
				sm.subnKeys.pop();						//	Remove last element	
				emit MSMSubscriptionRemoved(_subnKey);
				break;
			}
		} 
	}	//	removeMSMSubscription() //*/
	function removeMSMSubnNFT(uint256 _nftKey) override external managerOnly {
		address nftAddr = sm.nftAddrs[_nftKey];
		delete sm.nftMap[nftAddr];
		delete sm.nftAddrs[_nftKey];
		//	Find (the only) matching cell
		uint256 limit 	 = sm.nftKeys.length;
		for (uint256 i = 0; i < limit; i += 1) {
			if (sm.nftKeys[i] == _nftKey) { 
				sm.nftKeys[i] = sm.nftKeys[limit - 1];	//	Replace with last element
				sm.nftKeys.pop();						//	Remove last element	
				emit msmSubnNFTRemoved(_nftKey, nftAddr);
				break;
			}
		} 
	}	//	removeMSMSubnNFT()
	function removeAllMSMSubnNFTs() override external managerOnly { 
		uint256 subnCount = sm.subnKeys.length;
		for (uint256 i = 0; i < subnCount; i += 1) {
			uint256 subnKey = sm.subnKeys[i];
			Subscription memory subn = sm.subnMap[subnKey];
			delete subn.nftKeys;
			sm.subnMap[subnKey] = subn;
		}	
		uint256 keyCount = sm.nftKeys.length;
		for (uint256 i = 0; i < keyCount; i += 1) {
			uint256 nftKey = sm.nftKeys[i];
			address nftAddr = sm.nftAddrs[nftKey];
			delete sm.nftMap[nftAddr];
			delete sm.nftAddrs[nftKey];
		}
		delete sm.nftKeys;
	}	//	removeAllMSMSubnNFTs()
}