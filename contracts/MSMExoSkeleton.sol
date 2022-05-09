//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/*****************************************************\
*	MSMExoSkeleton.sol
*	A contract to contain skeletal definitions of 
*	delegated functions that are listed in the 
*	applicatioin's MSMFacade class.
*	This file is included in delegate contracts so that 
*	they will compile. 
/*****************************************************/

contract MSMExoSkeleton { 

	function isOwner(address _userAddr) external view returns (bool) {}
	
	function isManager(address _userAddr) external view returns (bool) {}
	
	function getFacadeIdentifiers() external view returns (uint256, uint256) {}

	function getMsgSender() external view returns (address) {}
	function getMsgData() external view returns (bytes memory) {}
}