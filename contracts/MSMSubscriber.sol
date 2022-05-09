//	SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;
	
import "./MSMModifiers.sol";

interface IMSMSubscriber { 
//	function msmSubscriberIsActive(address) internal view returns (bool);
	function addMSMSubscriber(address _subrAddr) external;
	function activateMSMSubscriber(address _subrAddr) external;
	function deactivateMSMSubscriber(address _subrAddr) external;
	function getMSMSubscriberCount() external view returns(uint256);
	function getMSMSubscriber(address payable _subrAddr) external view returns (address payable, bool, uint256[] memory);
	function getAllMSMSubrAddrs() external view returns (address payable[] memory);
	function getActiveMSMSubrAddrs() external view returns(address payable[] memory);
}

contract MSMSubscriber is IMSMSubscriber, MSMModifiers {
	
	event MSMSubscriberAdded(address indexed subrAddress, uint256 position);
	event MSMSubscriberRemoved(address indexed subrAddress, uint256 position); 
	event MSMSubscriberActivated(address indexed subrAddress);
	event MSMSubscriberDeactivated(address indexed subrAddress);
	
	function msmSubscriberIsActive(address _subrAddr) internal view returns (bool) {
	    Subscriber memory subr = sm.subrMap[_subrAddr];
	    if (subr.subrActive) {
	        return true;//  Subscriber both in mapping and active
	    }	
	    return false;   //  Subscriber not in mapping or not active
	}
	function addMSMSubscriber(address _subrAddr) override external managerOnly { 
		address payable subrAddr = payable(_subrAddr);
		if (!msmSubscriberIsActive(subrAddr)) { 			
			Subscriber memory subr;					
			subr.subrAddress = subrAddr;	
			subr.subrActive = true;			
			sm.subrMap[subrAddr] = subr;		//	Add it to the global map of Subscribers
			sm.subrAddrs.push(subrAddr);		//	Add the new Subscriber to the array of known Subscribers
			emit MSMSubscriberAdded(subrAddr, sm.subrAddrs.length);
		}
	}
	function activateMSMSubscriber(address _subrAddr) override external managerOnly {
		Subscriber memory subr = sm.subrMap[_subrAddr];
		subr.subrActive = true;
		sm.subrMap[_subrAddr] = subr;
		emit MSMSubscriberActivated(_subrAddr);
	}
	function deactivateMSMSubscriber(address _subrAddr) override external managerOnly{ 
		Subscriber memory subr = sm.subrMap[_subrAddr];
		subr.subrActive = false;
		sm.subrMap[_subrAddr] = subr;
		emit MSMSubscriberDeactivated(_subrAddr);
	}	
	function getMSMSubscriberCount() override external view managerOnly returns (uint256) {
		uint256 sc_ = sm.subrAddrs.length;
		return  sc_;
	}
	function getMSMSubscriber(address payable _subrAddr) override external view managerOnly returns (address payable, bool, uint256[] memory) {
		Subscriber memory subr;
		subr = sm.subrMap[_subrAddr];
		return (subr.subrAddress, subr.subrActive, subr.subnKeys); 
	} 	
	function getAllMSMSubrAddrs() override external view managerOnly returns (address payable[] memory) {
		return sm.subrAddrs;
	}
	function getActiveMSMSubrAddrs() override external view managerOnly returns(address payable[] memory) {
		uint256 activesNum = 0;
		uint256 subrsNum = sm.subrAddrs.length;
		address payable [] memory activeAddrs = new address payable[](subrsNum);
		Subscriber memory subscriber;
		for (uint256 i = 0; i < subrsNum; i += 1) {
			subscriber = sm.subrMap[sm.subrAddrs[i]];
			if (subscriber.subrActive) {
				activeAddrs[activesNum] = subscriber.subrAddress;
				activesNum += 1;
			}
		}
		address payable[] memory activeAddrs_ = new address payable[](activesNum);
		for (uint256 i = 0; i < activesNum; i += 1) {
			activeAddrs_[i] = activeAddrs[i];
		}
		return activeAddrs_;
	}
}	//	contract MSMSubscriber