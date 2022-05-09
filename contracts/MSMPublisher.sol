//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

import "./MSMModifiers.sol";	//	Imports MSMState, which imports MSMTypes & State1538

interface IMSMPublisher { 
//	function msmPublisherIsActive(address) internal view returns (bool);
	function addMSMPublisher(address _pubrAddr, string calldata _name) external;
	function activateMSMPublisher(address _pubrAddr) external;
	function getMSMPublisherCount() external view returns (uint256);
	function getMSMPublisher(address _pubrAddr) external view 
			returns (address payable, string memory, bool, uint[] memory); 	
	function getMSMPublisherNames() external view returns (string memory);
	function getActiveMSMPublishers() external view returns (string[] memory, address payable[] memory);
	function getAllMSMPubrAddrs() external view returns (address payable[] memory);
	function getActiveMSMPubrAddrs() external view returns(address payable[] memory);
}

contract MSMPublisher is IMSMPublisher, MSMModifiers {
	
	event MSMPublisherAdded(address indexed pubrAddress, string pubrName, uint256 position);
	event MSMPublisherRemoved(address indexed pubrAddress, string pubrName, uint256 position);
	event MSMPublisherActivated(address indexed pubrAddress, string pubrName);
	event MSMPublisherDeactivated(address indexed pubrAddress, string pubrName);
	event popped(string msg, uint256 index);

//	INTERNAL	
	function msmPublisherIsActive(address _pubrAddr) internal view returns (bool) {
	    Publisher memory pubr = sm.pubrMap[_pubrAddr];
	    if (pubr.pubrActive) {
	        return true;//  Publisher both in mapping and active
	    }	
	    return false;   //  Publisher not in mapping or not active
	}		
//	EXTERNAL
	function addMSMPublisher(address _pubrAddr, string calldata _name) override external managerOnly {
		address payable pubrAddr = payable(_pubrAddr);
		if (!msmPublisherIsActive(pubrAddr)) { 			
			Publisher memory pubr;					
			pubr.pubrAddress = pubrAddr;	
			pubr.pubrName = _name;
			pubr.pubrActive = true;			
			sm.pubrMap[pubrAddr] = pubr;	//	Add it to the global map of Publishers
			sm.pubrAddrs.push(pubrAddr);	//	Add the new Publisher to the array of known Publishers
			emit MSMPublisherAdded(pubrAddr, _name, sm.pubrAddrs.length);
		}
	}  
	function activateMSMPublisher(address _pubrAddr) override external managerOnly {
		Publisher memory pubr = sm.pubrMap[_pubrAddr];
		string memory pubrName = pubr.pubrName;
		pubr.pubrActive = true;
		sm.pubrMap[_pubrAddr] = pubr;
		emit MSMPublisherActivated(_pubrAddr, pubrName);
	}
	function getMSMPublisherCount() override external view managerOnly returns (uint256) {
	    uint256 pc_ = sm.pubrAddrs.length;
		return  pc_;
	} 
	function getMSMPublisher(address _pubrAddr) override external view  managerOrPublisher
			returns (address payable, string memory, bool, uint256[] memory) {
		Publisher memory pubr;
	    pubr = sm.pubrMap[_pubrAddr];
		return(pubr.pubrAddress, pubr.pubrName, pubr.pubrActive, pubr.pubnKeys);
	}	
	function getMSMPublisherNames() override external view managerOnly returns(string memory) {
		string memory pubrNames = "Participating Publishers:\n";
		bytes memory byteNames = bytes(pubrNames);
		for (uint i = 0; i < sm.pubrAddrs.length; i++) {
			address pAddr = sm.pubrAddrs[i];
			Publisher memory pbr;
			pbr = sm.pubrMap[pAddr];
			if(pbr.pubrActive) {
				byteNames = abi.encodePacked(byteNames, bytes(pbr.pubrName));
				byteNames = abi.encodePacked(byteNames, "\n");
			}
		}		
		pubrNames = string(byteNames);
		return pubrNames;
	} 	
	function getActiveMSMPublishers() override external view managerOnly returns (string[] memory, address payable[] memory) { 
		uint256 activesNum = 0;
		uint256 pubrsNum = sm.pubrAddrs.length;
		string[] memory activeNames = new string[](pubrsNum);
		address payable [] memory activeAddrs = new address payable[](pubrsNum);
		Publisher memory publisher;
		for (uint256 i = 0; i < pubrsNum; i += 1) {
			publisher = sm.pubrMap[sm.pubrAddrs[i]];
			if (publisher.pubrActive) {
				activeNames[activesNum] = publisher.pubrName;
				activeAddrs[activesNum] = publisher.pubrAddress;
				activesNum += 1;
			}
		}
		string[] memory activeNames_ = new string[](activesNum);
		address payable[] memory activeAddrs_ = new address payable[](activesNum);
		for (uint256 i = 0; i < activesNum; i += 1) {
			activeNames_[i] = activeNames[i];
			activeAddrs_[i] = activeAddrs[i];
		}
		return (activeNames_, activeAddrs_);
	}
	function getAllMSMPubrAddrs() override external view managerOnly returns (address payable[] memory) {
		return sm.pubrAddrs;
	}
	function getActiveMSMPubrAddrs() override external view managerOnly returns(address payable[] memory) {
		uint256 activesNum = 0;
		uint256 pubrsNum = sm.pubrAddrs.length;
		//	Count the number of active Publishers
		for (uint256 i = 0; i < pubrsNum; i += 1) {
			address pubrAddr = sm.pubrAddrs[i];
			if(sm.pubrMap[pubrAddr].pubrActive) {
				activesNum += 1;
			}
		}
		//	Use the count to dimension a return array of appropriate size 
		address payable[] memory retAddrs_ = new address payable[](activesNum);
		//	Populate the return array with addresses of active Publishers only
		uint256 j = 0;
		for (uint256 i = 0; i < pubrsNum; i += 1) { 
			address payable pubrAddr = sm.pubrAddrs[i];
			if (sm.pubrMap[pubrAddr].pubrActive) {
				retAddrs_[j++] = pubrAddr;
			}
		}
		return retAddrs_;		
	}	
}	//	contract MSMPublisher