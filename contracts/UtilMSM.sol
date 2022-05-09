//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Contains functions for retrieving internal state variables, addresses for
* key participants in the DApp. 
/******************************************************************************/

import "./MSMModifiers.sol";	//	Imports MSMState, which imports MSMTypes & State1538

interface IUtilMSM { 
	function getMsgSender() external view returns (address);
	function  getTxOrigin() external view returns (address);	
	function   getMsgData() external pure returns (bytes calldata);
	function  getMSMOwner() external view returns (address);	
	function getMSMVersion() external view returns (string memory);
	function getMSMTitle() external view returns (string memory);
	function getMSMDescription() external view returns (string memory);
	function isOwner(address _user) external view returns (bool); 
	function getFactoryID() external view returns(uint256);
	function getFacadeSequenceNumber() external view returns(uint256);
	function getFacadeIdentifiers()external view returns (uint256, uint256); 
}
contract UtilMSM is IUtilMSM, MSMModifiers { 	
	function getMsgSender() override external view returns(address) {
		return msg.sender;
	}
	function  getTxOrigin() override external view returns (address) { 
		return tx.origin; 
	}
	function getMsgData() override external pure returns (bytes memory) {
			bytes memory data = msg.data; 	
			return data;
	}
	function getMSMOwner() override external view ownerOnly returns (address) {
		return sm.msmOwner;
	}
	function getMSMVersion() override external view ownerOnly returns (string memory) {
		return sm.msmVersion;
	}	
	function getMSMTitle() override external view returns (string memory) { 
		return sm.msmTitle;
	}
	function getMSMDescription() override external view returns (string memory) {
		return sm.msmDescription;
	}	
	function isOwner(address _user) override external view returns (bool) {
		return (_user == sm.msmOwner);
	}
	function getFactoryID() override external view returns(uint256) {
		return sm.factoryID;
	}
	function getFacadeSequenceNumber() override external view returns(uint256) {
		return sm.facadeSequenceNumber; 
	}
	function getFacadeIdentifiers() override external view returns (uint256, uint256) {
		uint256 factoryID_ = sm.factoryID; 
		uint256 facadeSequenceNumber_ = sm.facadeSequenceNumber;
		return (factoryID_, facadeSequenceNumber_);
	}		
}	//	contract UtilMSM