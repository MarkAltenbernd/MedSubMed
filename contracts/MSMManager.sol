//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Contains functions for retrieving internal state variables, addresses for
* key participants in the DApp. 
/******************************************************************************/

import "./MSMModifiers.sol";	//	Imports MSMState, which imports MSMTypes & State1538

interface IMSMManager { 
//	function managerInArray(address _mngrAddress) internal view returns(bool);
	function addMSMManager(address _mngrAddress) external;
	function getMSMManagerCount() external view returns (uint256);
	function getMSMManager(address payable _mngrAddress) external view returns (Manager memory);
	function getActiveMSMManagers() external view returns (address payable[] memory);
	function getAllMSMManagers() external view returns (address payable[] memory);
	function isManager(address _mngrAddr) external view returns (bool);		
}

contract MSMManager is IMSMManager, MSMModifiers { 	

	event MSMManagerAdded(address mngrAddress, uint256 position);
	event MSMManagerRemoved(address mngrAddress, uint256 position);

	function managerInArray(address _mngrAddress) internal view returns(bool) {
		for (uint i = 0; i < sm.mngrAddrs.length; i += 1) {
			if (sm.mngrAddrs[i] == _mngrAddress) {
				return true;
			}
		}
		return false;
	}	
	function addMSMManager(address _mngrAddress) override external managerOnly { 
		address payable mngrAddress = payable(_mngrAddress);
		if (!managerInArray(mngrAddress)) {	
			sm.mngrAddrs.push(mngrAddress);
			uint256 position = sm.mngrAddrs.length - 1;
			Manager memory mngr;
			mngr.mngrAddress = mngrAddress;
			mngr.mngrActive = true;
			sm.mngrMap[_mngrAddress] = mngr;
			emit MSMManagerAdded(mngrAddress, position);
		}
	}
	function getMSMManagerCount() override external view managerOnly returns(uint256) {
		return sm.mngrAddrs.length;
	}
	function getMSMManager(address payable _mngrAddress) override external view managerOnly returns (Manager memory) {
			return sm.mngrMap[_mngrAddress];
			
	}
	function getActiveMSMManagers() override external view managerOnly returns(address payable[] memory) {
		uint256 activesNum = 0;
		uint256 mngrsNum = sm.mngrAddrs.length;
		address payable[] memory actives = new address payable[](mngrsNum);
		Manager memory manager;
		for (uint256 i = 0; i < mngrsNum; i += 1) {
			manager = sm.mngrMap[sm.mngrAddrs[i]];
			if (manager.mngrActive) {
				actives[activesNum] = sm.mngrAddrs[i];
				activesNum += 1;
			}
		}	
		address payable[] memory actives_ = new address payable[](activesNum);
		for (uint256 i = 0; i < activesNum; i += 1) {
			actives_[i] = actives[i];
		}
		return actives_;
	}
	function getAllMSMManagers() override external view managerOnly returns (address payable[] memory) {
		uint mngrsNum = sm.mngrAddrs.length;
		address payable[] memory managers_ = new address payable[](mngrsNum);
		for (uint i = 0; i < mngrsNum; i += 1) {
			managers_[i] = sm.mngrAddrs[i];
		}
		return managers_;
	}	
	function isManager(address _mngrAddr) override external view returns (bool) {
			if (sm.mngrMap[_mngrAddr].mngrActive) {
				return true;
			}
			return false;
	}	
}	//	contract UtilMSM