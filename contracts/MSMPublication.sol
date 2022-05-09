//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

import "./MSMKeys.sol";
import "./MSMModifiers.sol";
import "./MSMDeployedAddresses.sol";

interface IMSMPublication {
	
//	function msmPublicationIsActive(uint256 _pubnIndex) internal view returns(bool);	
	function addMSMPublication(string calldata _title, string calldata _desc) external returns(uint256 pubnKey_);
	function activateMSMPublication(uint256 _pubnKey) external;
	function deactivateMSMPublication(uint256 _pubnKey) external;
	function getMSMPublicationByKey(uint256 _pubnkey) external view returns (uint256, 
		string memory, string memory, address, uint256, uint256, uint256, bool);
	function getMSMPublicationByIndex(uint256 _index) external view returns (uint256, 
		string memory, string memory, address, uint256, uint256, uint256, bool); 
	function editMSMPublication(uint256 _pubnKey, string calldata _title, string calldata _desc, 
		uint256 _term, uint256 _rent, uint256 _purch, bool _active) external;
	function getPubrPubnKeys(address _pubrAddr) external view returns(uint256[] memory);
	function getMSMPublicationSubscriptions(uint256 _pubnIndex) external view returns (uint256[] memory);
	function getPubnPubrAddress(uint256 _pubnKey) external view returns(address);	
	function getPublicationCount() external view returns(uint256);
	function removeAllMSMPublications() external;
	function getAllMSMPubnKeys() external view returns (uint256[] memory);
	function getActiveMSMPubnKeys() external view returns (uint256[] memory); 
}

contract MSMPublication is IMSMPublication, MSMModifiers, MSMDeployedAddresses {
	
	event MSMPublicationAdded(address indexed pubrAddr, uint256 pubnKey);
	event MSMPublicationEdited(address indexed pubrAddr, uint256 pubnKey, string title);
	event MSMPublicationActivated(address indexed pubrAddr, uint256 pubnKey, string title);
	event MSMPublicationDeactivated(address indexed pubrAddr, uint256 pubnKey, string title);	
	event MSMPublicationsCounted(string countMsg, uint256 numPubrs);
	event MSMPubrPubnsRemoved(string msg, uint256 limit);
	event MSMPublicationsRemoved(string msg, uint256 limit);
	
	constructor () {
	}
	
//	INTERNAL functions
	function msmPublicationIsActive(uint256 _pubnKey) internal view returns(bool) {
		return sm.pubnMap[_pubnKey].pubnActive;
	}
	
//	EXTERNAL functions
//	All are publisherOnly . . . 
	function addMSMPublication(string calldata _title, string calldata _desc) override external 
					publisherOnly  returns(uint256 pubnKey_) {
		address pubrAddr = msg.sender; 
		
		MSMKeys msmKeys = MSMKeys(atMSMKeys);
		pubnKey_ = msmKeys.next(); 
		
		//	 Create a new Publication and populate it
		Publication memory pubn;	
		pubn.pubnKey = pubnKey_; 
		pubn.pubrAddress = payable(pubrAddr);
		pubn.pubnTitle = _title;
		pubn.pubnDescription = _desc;
		pubn.pubnActive = true;
		//	Save the new Publication
		sm.pubnMap[pubnKey_] = pubn;	//	Save  in global mapping
		sm.pubnKeys.push(pubnKey_);	//	Add to global shadow array
		sm.pubrMap[pubrAddr].pubnKeys.push(pubnKey_);	//	Add to Pubr-specific array
		
		emit MSMPublicationAdded(pubrAddr, pubnKey_);
	}	
	function activateMSMPublication(uint256 _pubnKey) override external {
		Publication memory pubn = sm.pubnMap[_pubnKey];
		require(pubn.pubrAddress == msg.sender, "Available only to this Publicatiion's Publisher.");
		pubn.pubnActive = true;
		sm.pubnMap[_pubnKey] = pubn;
		emit MSMPublicationActivated(pubn.pubrAddress, pubn.pubnKey, pubn.pubnTitle);
	}	
	function deactivateMSMPublication(uint256 _pubnKey) override external {
		Publication memory pubn = sm.pubnMap[_pubnKey];
		require(pubn.pubrAddress == msg.sender, "Available only to this Publicatiion's Publisher.");
		pubn.pubnActive = false;
		sm.pubnMap[_pubnKey] = pubn;
		emit MSMPublicationDeactivated(pubn.pubrAddress, pubn.pubnKey, pubn.pubnTitle);
	}
	function getMSMPublicationByKey(uint256 _pubnKey) override external view publisherOnly 
				returns (uint256, string memory, string memory, address, uint256, uint256,
							uint256, bool) {
			Publication memory pubn = sm.pubnMap[_pubnKey];
			return (pubn.pubnKey, pubn.pubnTitle, pubn.pubnDescription, pubn.pubrAddress, pubn.term, 
					pubn.rentalPrice, pubn.purchasePrice, pubn.pubnActive);
	}	
	function getMSMPublicationByIndex(uint256 _pubnIndex) override external view publisherOnly 
				returns (uint256, string memory, string memory, address, uint256, uint256,
							uint256, bool) {
			uint256 pubnKey = sm.pubnKeys[_pubnIndex];
			Publication memory pubn = sm.pubnMap[pubnKey];
			return (pubn.pubnKey, pubn.pubnTitle, pubn.pubnDescription, pubn.pubrAddress, pubn.term, 
					pubn.rentalPrice, pubn.purchasePrice, pubn.pubnActive);
	}
	function editMSMPublication(uint256 _pubnKey, string calldata _title, string calldata _desc, 
								uint256 _term, uint _rent, uint256 _purch, bool _active) 
								override external publisherOnly {
		require(sm.pubnMap[_pubnKey].pubrAddress == msg.sender, "Available only to this Publicatiion's Publisher.");
		Publication memory pubn  = sm.pubnMap[_pubnKey];
		pubn.pubnTitle = _title;
		pubn.pubnDescription = _desc;
		pubn.term = _term;
		pubn.rentalPrice = _rent;
		pubn.purchasePrice  = _purch;
		pubn.pubnActive = _active;
		sm.pubnMap[_pubnKey] = pubn;
		emit MSMPublicationEdited(msg.sender, pubn.pubnKey, _title);
	}		
	function getMSMPublicationSubscriptions(uint256 _pubnKey) override external view publisherOnly returns (uint256[] memory) {
		//	Returns a list of keys for all Subscriptions that contain the subject Publication
		address pubrAddr = sm.pubnMap[_pubnKey].pubrAddress;
		require(msg.sender == pubrAddr 
			 || msg.sender == sm.msmOwner, "Requester not allowed access to Publication.");
		return sm.pubnMap[_pubnKey].subnKeys;
	}	
	function getPubnPubrAddress(uint256 _pubnKey) override external view publisherOnly returns(address) {
		return sm.pubnMap[_pubnKey].pubrAddress;
	}	
	//	. . . managerOrPublisher . . . 
	function getPublicationCount() override external view managerOrPublisher 
					returns(uint256) {
		//	For Owner or an active Manager, a count of all Publications . . .
		if (msg.sender == sm.msmOwner || sm.mngrMap[msg.sender].mngrActive) {
			return sm.pubnKeys.length;
		}
		// . . . but for a Publisher, a count of only his Publications . . . 
		if (sm.pubrMap[msg.sender].pubrActive) {
			return sm.pubrMap[msg.sender].pubnKeys.length;
		}
		//	. . . but not the Owner, an active Manager, or an active Publisher.
			return 0;
	}
	function getPubrPubnKeys(address _pubrAddr) override external view managerOrPublisher 
									returns(uint256[] memory) {
		//	Returns a list of keys for all Publications of the subject Publisher
		return sm.pubrMap[_pubrAddr].pubnKeys; 
	}
	function getAllMSMPubnKeys() override external view managerOrPublisher returns (uint256[] memory) { 
		//	For owner or active Manager, a list of all Publication keys . . . 
		if (msg.sender == sm.msmOwner || sm.mngrMap[msg.sender].mngrActive) {
			return sm.pubnKeys; 
		}
		//	. . . but for a specific active Publisher, a list of only his Publication keys . . .
		if (sm.pubrMap[msg.sender].pubrActive) {
			return sm.pubrMap[msg.sender].pubnKeys;
		}
		//	. . . but not the Owner, an active Manager, or an active Publisher.
			uint256[] memory retNull; 
			return retNull;			//	Return an array of length 0
	}
	function getActiveMSMPubnKeys() override external view managerOrPublisher returns(uint256[] memory) {
		
		uint256[] memory pubnKeys; 
		
		//	For owner or active Manager, a list of all Publication keys . . . 
		if (msg.sender == sm.msmOwner || sm.mngrMap[msg.sender].mngrActive) {
			pubnKeys = sm.pubnKeys; 
		} 
		//	. . . but for a specific active Publisher, a list of only his Publication keys . . .
		else if (sm.pubrMap[msg.sender].pubrActive) { 
			pubnKeys = sm.pubrMap[msg.sender].pubnKeys;
		}
		//	Now count just the active Publications
		uint256 activeCount = 0;
		for (uint256 i = 0; i < pubnKeys.length; i += 1) {
			if (sm.pubnMap[pubnKeys[i]].pubnActive) {
				activeCount += 1;
			}
		}
		//	Now select just the active Publications
		uint256[] memory retKeys_ = new uint256[](activeCount) ;
		uint256 j = 0;
		for (uint256 i = 0; i < pubnKeys.length; i += 1) { 
			if (sm.pubnMap[pubnKeys[i]].pubnActive) {
				retKeys_[j++] = pubnKeys[i];
			}
		} 
		return retKeys_;
	}
	//	. . . ownerOnly.
	//	Intended for admin/test use only. 
	//	Use with extreme care. It is potentially both damaging and expensive.
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
	}	//	removeAllMSMPublications()
}