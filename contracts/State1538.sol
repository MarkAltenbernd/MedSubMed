//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Author: 	Mark Altenbernd
\******************************************************************************/

struct State1538 {
	address 					contractOwner;
	mapping(bytes4 => address)	delegates;
	bytes[] 					funcSignatures;
	mapping(bytes => uint256)	funcSignatureToIndex;
} 