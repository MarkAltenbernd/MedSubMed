//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
*	 Author: 	Mark Altenbernd
*	A contract to generate unique unsigned 256-bit values 
*	to be used as primary keys 
*	Should be instantiated once then left to run eternally
\******************************************************************************/

contract MSMKeys {
    uint256 private key; 
    
	constructor () { }
    function current() public view returns (uint256) { 
		return key;      
    }
    function next() public returns (uint256) { 
		key += 1;
		return key;
    }
}	//	contract MSMKeys