//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
	
import "./MSMKeys.sol";
import "./MSMModifiers.sol";	
import "./MSMDeployedAddresses.sol";
import "./MSMExoSkeleton.sol";
import "./UtilMSM.sol";
import "./Uint2String.sol";

interface IMSMSubscription { 
//	function concat(string memory a, string memory b) internal pure returns (string memory)
//	function msmSubscriptionIsActive(uint246 _subnKey) internal view returns(bool);
//	function senderIsThePublisher(address _pubnAddr) internal view returns (bool);
//	function senderIsTheSubscriber(address _subrAddr) internal view returns (bool);
	function addMSMSubscription(address _subrAddr, uint256 _pubnKey) external; 
	function getPubnViaSubn(uint256 _pubnKey) external view returns (Publication memory); 
	function activateMSMSubscription(uint256 _subnKey) external;
	function deactivateMSMSubscription(uint256 _subnKey) external;
	function editMSMSubscription(uint256 _subnKey, uint256 _subnStart, uint256 _subnEnd, uint256 _subnPaid, bool _subnActive) external;
}
contract MSMSubscription is IMSMSubscription, MSMModifiers, MSMDeployedAddresses, MSMExoSkeleton {	
	using Uint2String for uint256;
	
	event MSMSubscriptionAdded(uint256 indexed subnKey, uint256 indexed nftKey, address indexed subrAddr, string pubnTitle);
	event MSMSubscriptionActivated(uint256 indexed subnKey);
	event MSMSubscriptionDeactivated(uint256 indexed subnKey);
	event MSMSubscriptionEdited(uint256 indexed subnKey);
	
//	CONSTRUCTOR - Purely empty	
	constructor() {}
//	INTERNAL functions	
	function concat(string memory a, string memory b) internal pure returns (string memory) {
		return string(abi.encodePacked(a, b)); 
	}
	function msmSubscriptionIsActive(uint256 _subnKey) internal view returns(bool) {
		return sm.subnMap[_subnKey].subnActive;
	}
	function senderIsThePublisher(uint256 _subnKey) internal view returns(bool) {
		if (!sm.pubrMap[tx.origin].pubrActive) { 
			return false;
		}
		uint256 pubnKey = sm.subnMap[_subnKey].pubnKey;
		if (pubnKey == 0) {
			return false;
		}
		address pubrAddress = sm.pubnMap[pubnKey].pubrAddress; 
		if (tx.origin != pubrAddress) {
			return false;
		}
		return true;
	}
	function senderIsTheSubscriber(uint256 _subnKey) internal view returns (bool) {
		if(!sm.subrMap[tx.origin].subrActive) {
			return false;
		}
		address subrAddress = sm.subnMap[_subnKey].subrAddress; 
		if (tx.origin != sm.subrMap[subrAddress].subrAddress) {
			return false;
		}
		return true;		
	}
//	EXTERNAL functions
	function addMSMSubscription(address _subrAddr, uint256 _pubnKey) override external 
					subscriberOnly {	
					
		require(sm.pubnMap[_pubnKey].pubnActive == true, "*** This Publication is not available. ***"); 
		
		//	Create property values for a new MSMSubscriptionNFT
		string memory _title	= sm.pubnMap[_pubnKey].pubnTitle; 
		string memory factID	= sm.factoryID.toHexString();
		string memory facSeqNo	= sm.facadeSequenceNumber.toHexString(); 
		string memory s1		= "MedSubMed: ";
		string memory _symbol	= concat(s1, factID);
		_symbol					= concat(_symbol, "-");
		_symbol					= concat(_symbol, facSeqNo); 
		MSMKeys msmKeys 		= MSMKeys(atMSMKeys);
		uint256 _subnKey		= msmKeys.next();
		uint256 _nftKey			= msmKeys.next();
		
		//	Create a new Subscription and populate it
		Subscription memory subn; 
		subn.subnKey = _subnKey;
		subn.pubnKey = _pubnKey; 
		subn.subnActive = true;
		subn.subrAddress = payable(_subrAddr);
//		subn.nftKeys.push(_nftKey);	Member "push" is not available in uint256[] memory outside of storage.
		//	Create a new Subscription-related NFT
		address nftAddress		   = address(new MSMSubscriptionNFT(_title, _symbol, _subnKey, _nftKey));
		MSMSubscriptionNFT subnNFT = MSMSubscriptionNFT(nftAddress);
		//	Populate global state variables
		sm.subnKeys.push(_subnKey);
		sm.subnMap[_subnKey] = subn; 
		sm.subrMap[_subrAddr].subnKeys.push(_subnKey);
		sm.pubnMap[_pubnKey].subnKeys.push(_subnKey);
		
		sm.nftMap[nftAddress] = subnNFT;
		sm.nftAddrs[_nftKey] = nftAddress;
		sm.nftKeys.push(_nftKey);	
		sm.subnMap[_subnKey].nftKeys.push(_nftKey);	//	Ths is in storage, so "push" is available

		uint256 subnKey_ = _subnKey;						//	Set value of return parameter		
		emit MSMSubscriptionAdded(subnKey_,  _nftKey, _subrAddr, _title); 
	}	//	addMSMSubscription()	//*/
	function getPubnViaSubn(uint256 _pubnKey) override external view returns (Publication memory) {
		return sm.pubnMap[_pubnKey];
	}
	function activateMSMSubscription(uint256 _subnKey) override external { 
		require(senderIsThePublisher(_subnKey) ||
				senderIsTheSubscriber(_subnKey)||
				this.isManager(tx.origin) || this.isOwner(tx.origin), 
				"*** Rquestor must be either the Publisher or the Subscriber ***");
		sm.subnMap[_subnKey].subnActive = true;
		emit MSMSubscriptionActivated(_subnKey);
	}
	function deactivateMSMSubscription(uint256 _subnKey) override external { 
		require(senderIsThePublisher(_subnKey) ||
				senderIsTheSubscriber(_subnKey)||
				this.isManager(tx.origin) || this.isOwner(tx.origin), 
				"*** Rquestor must be either the Publisher or the Subscriber ***");
		sm.subnMap[_subnKey].subnActive = false;
		emit MSMSubscriptionDeactivated(_subnKey);
	}
	function editMSMSubscription(uint256 _subnKey, uint256 _subnStart, uint256 _subnEnd, uint256 _subnPaid, bool _subnActive) override external managerOnly {
		Subscription memory subn = sm.subnMap[_subnKey];
		require(subn.subrAddress != address(0x0) && 
				subn.pubnKey != 0x0, "*** Specified Subscription does not exist. ***");
		subn.subnStart= _subnStart;
		subn.subnEnd = _subnEnd;
		subn.subnPaid = _subnPaid;
		subn.subnActive = _subnActive;
		sm.subnMap[_subnKey] = subn;
		emit MSMSubscriptionEdited(_subnKey);
	}
}	//	contract MSMSubscription