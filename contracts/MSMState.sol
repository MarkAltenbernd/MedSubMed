//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Author:		Mark Altenbernd
\******************************************************************************/

import "./State1538.sol";
import "./MSMTypes.sol";
import "./MSMSubscriptionNFT.sol";	

//	STATE VARIABLES
struct MSMState {
	State1538							st;	
	/*	Variables supporting ERC-1538 snd found in ./State1538.sol
		address 						contractOwner;
		mapping(bytes4 => address)		delegates;
		bytes[] 						funcSignatures;
		mapping(bytes => uint256)		funcSignatureToIndex;	
	*/		
	//	Variables specific to theMedSubMeb DApp	
	uint256									factoryID;	
	uint256									facadeSequenceNumber;	
	address payable 						msmOwner;
	string          						msmVersion;
	string          						msmTitle;
	string          						msmDescription;
	uint256         						publicationCount;
	uint256         						subscriberCount;
	uint256         						subscriptionCount;
	uint256         						mediaListCount; 
	uint256         						viewRequestedCount;
	uint256         						viewGrantedCount;
	
	//	Mappings and their iterable shadow arrays
	mapping (address => Manager)    		mngrMap;
	address payable[]						mngrAddrs;
	
	mapping (address => Publisher)  		pubrMap;
	address payable[]       				pubrAddrs;
	
	mapping (address => Subscriber) 		subrMap;
	address payable[]						subrAddrs;
	
	mapping (uint256 => Publication)		pubnMap;
	uint256[]   							pubnKeys;
	
	mapping (uint256 => Subscription)		subnMap; 
	uint256[]  								subnKeys;
	
	mapping (address => MSMSubscriptionNFT)	nftMap;		
	mapping (uint256 => address) 			nftAddrs;
	uint256[]								nftKeys; 
	
	uint256[]     							mediaLists;
	uint256[]       						viewings; 
	
}
