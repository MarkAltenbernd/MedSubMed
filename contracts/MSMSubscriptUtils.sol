//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
	
import "./MSMModifiers.sol";	
import "./MSMDeployedAddresses.sol";
import "./MSMExoSkeleton.sol";
import "./UtilMSM.sol";

interface IMSMSubscriptUtils {
//	function senderIsThePublisher(uint256 _subnKey) internal view returns(bool);
//	function senderIsTheSubscriber(uint256 _subnKey) internal view returns (bool);
	function getSubscriptionCount() external view returns (uint256);
	function getPubnSubnCount(uint256 _pubnKey) external view returns (uint256);
	function getPubrSubnCount(address _pubrAddr) external view returns (uint256);
	function getSubrSubnCount(address _subrAddr) external view returns (uint256);
	function getAllMSMSubscriptions() external view returns (Subscription[] memory); 
	function getActiveMSMSubscriptions() external view returns (Subscription[] memory);
	function getAllMSMSubnKeys() external view returns (uint256[] memory);
	function getActiveMSMSubnKeys() external view returns (uint256[] memory);
	function getMSMSubscriptionByIndex(uint256 _subnIndex) external view returns (Subscription memory msmSubn_);
	function getMSMSubscriptionByKey(uint256 _subnKey) external view returns (Subscription memory msmSubn_);
}
contract MSMSubscriptUtils is IMSMSubscriptUtils, MSMModifiers, MSMDeployedAddresses, MSMExoSkeleton { 

	event MSMSubscriptionRemoved(uint256 indexed subnKey); 

//	INTERNAL
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
//	EXTERNAL
	function getSubscriptionCount() override external view returns (uint256) {
		//	Does not descriminate between active and inactive Subscriptions 
		uint256 subnCount_ = 0;
		//	For the owner or an active Manager, count all Subscriptions 
		if (tx.origin == sm.msmOwner || sm.mngrMap[tx.origin].mngrActive ) {
			return sm.subnKeys.length;
		}
		//	For an active Publisher, count all Subscriptions to his Publications
		if (sm.pubrMap[tx.origin].pubrActive) {
			uint256 pubnCount = sm.pubrMap[tx.origin].pubnKeys.length;
			subnCount_ = 0;
			for(uint256 i = 0; i < pubnCount; i += 1) {
				uint256 pubnKey = sm.pubrMap[tx.origin].pubnKeys[i];
				subnCount_ += sm.pubnMap[pubnKey].subnKeys.length;
			}
			return subnCount_;
		}
		//	For an active Subscriber, count all his Subscriptions
		if(sm.subrMap[tx.origin].subrActive) {
			subnCount_ = sm.subrMap[tx.origin].subnKeys.length;
			return subnCount_;
		}
		//	Sender is not owner, active Manager, active Publisher, or active Subscriber	. . . 
		//	. . . so force reversion
		require(subnCount_ != subnCount_, "*** Function not available ***");
		return subnCount_;
	}
	function getPubnSubnCount(uint256 _pubnKey) override external view returns (uint256) {
		Publication memory pubn = sm.pubnMap[_pubnKey];
		address pubrAddr = pubn.pubrAddress;
		require( 
			((pubrAddr == tx.origin) && (sm.pubrMap[pubrAddr].pubrActive)) ||
			sm.msmOwner == tx.origin || 
			sm.mngrMap[pubrAddr].mngrActive, 
			"*** Function not available ***"
		);
		uint256 subnCount_ = sm.pubnMap[_pubnKey].subnKeys.length;
		return subnCount_;
	}
	function getPubrSubnCount(address _pubrAddr) override external view returns (uint256) {
		require (
			((_pubrAddr == tx.origin) && (sm.pubrMap[_pubrAddr].pubrActive)) || 
			sm.msmOwner == tx.origin ||
			sm.mngrMap[_pubrAddr].mngrActive,
			"*** Function not available ***"
		); 
		uint256 subnCount_ = 0;
		uint256[] memory pubnKeys = sm.pubrMap[_pubrAddr].pubnKeys; 
		for (uint256 i = 0; i < pubnKeys.length; i += 1) {
			subnCount_ += sm.pubnMap[pubnKeys[i]].subnKeys.length;
		}
		return subnCount_;
	}
	function getSubrSubnCount(address _subrAddr) override external view returns (uint256) {
		require (
			((_subrAddr == tx.origin) && (sm.subrMap[_subrAddr].subrActive)) || 
			sm.msmOwner == tx.origin ||
			sm.mngrMap[_subrAddr].mngrActive,
			"*** Function not available ***"
		);
		uint256 subnCount_ = sm.subrMap[_subrAddr].subnKeys.length;
		return subnCount_;
	}
	function getAllMSMSubscriptions() override external view managerOnly returns (Subscription[] memory) {
		uint256 subnsNum = sm.subnKeys.length;
		Subscription[] memory subns_ = new Subscription[](subnsNum); 
		for (uint256 i = 0; i < subnsNum; i += 1) {
			subns_[i] = sm.subnMap[sm.subnKeys[i]];
		}
		return subns_;
	}
	function getActiveMSMSubscriptions() override external view managerOnly returns (Subscription[] memory) {
		uint256 subnsNum = sm.subnKeys.length;
		Subscription[] memory subns = new Subscription[](subnsNum); //	Long enuff to hold ALL subns
		uint256 activesNum = 0;
		Subscription memory subscription; 
		for (uint256 i = 0; i < subnsNum; i += 1) {
			subscription = sm.subnMap[sm.subnKeys[i]];
			if (subscription.subnActive) {
				subns[activesNum] = subscription;
				activesNum += 1;
			}
		}
		Subscription[] memory subns_ = new Subscription[](activesNum);	//	Long enuff to hold only ACTIVE subns
		for (uint256 i = 0; i < activesNum; i += 1) {
			subns_[i] = subns[i];
		}
		return subns_;
	}
	function getAllMSMSubnKeys() override external view managerOnly returns (uint256[] memory) {
		return sm.subnKeys;
	}
	function getActiveMSMSubnKeys() override external view managerOnly returns (uint256[] memory) {
		uint256 subnsNum = sm.subnKeys.length; 
		uint256[] memory subnKeys = new uint256[](subnsNum);
		uint256 subnKey;
		uint256 activesNum = 0;
		for (uint256 i = 0; i < subnsNum; i += 1) {
			subnKey= sm.subnKeys[i];
			if (sm.subnMap[subnKey].subnActive) {
				subnKeys[activesNum] = subnKey;
				activesNum += 1;
			}
		}
		uint256[] memory subnKeys_ = new uint256[](activesNum);
		for (uint256 i = 0; i < activesNum; i += 1) {
			subnKeys_[i] = subnKeys[i];
		}
		return subnKeys_;
	}	//*/
	function getMSMSubscriptionByIndex(uint256 _subnIndex) override external view returns (Subscription memory msmSubn_) { 
		require(_subnIndex < sm.subnKeys.length, "*** Subscription is not available. ***");
		uint256 subnKey = sm.subnKeys[_subnIndex];
		require(senderIsThePublisher(subnKey) ||
				senderIsTheSubscriber(subnKey)||
				this.isManager(tx.origin) || 
				this.isOwner(tx.origin), 
				"*** Requestor must be either the Publisher or the Subscriber ***");
		msmSubn_ = sm.subnMap[subnKey];
	}
	function getMSMSubscriptionByKey(uint256 _subnKey) override external view returns (Subscription memory msmSubn_) { 
		require(senderIsThePublisher(_subnKey) ||
				senderIsTheSubscriber(_subnKey)||
				this.isManager(tx.origin) || 
				this.isOwner(tx.origin), 
				"*** Rquestor must be either the Publisher or the Subscriber ***");
		msmSubn_ = sm.subnMap[_subnKey];
	}
}