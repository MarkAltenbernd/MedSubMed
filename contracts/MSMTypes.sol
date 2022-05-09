//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Author:				Mark Altenbernd
\******************************************************************************/

//	CUSTOM TYPES
	struct Manager {
		address payable mngrAddress;
		bool mngrActive;
	}
	struct Publisher {
		address payable pubrAddress;
		string pubrName;
		bool pubrActive;
		uint256[] pubnKeys; 
	}
	struct Subscriber {
		address payable subrAddress;
		bool subrActive;
		uint256[] subnKeys;
	}
	struct Publication {
		uint256 pubnKey;
		address payable pubrAddress;
		string pubnTitle;
		string pubnDescription;
		uint term;
		uint rentalPrice;
		uint purchasePrice;
		bool pubnActive;
		uint256[] subnKeys;
	}
	struct Subscription {
		uint256 subnKey;
		address payable subrAddress;
		uint256 pubnKey;
		uint256 subnStart;
		uint256 subnEnd;
		uint256 subnPaid;
		bool subnActive;
		uint256[] nftKeys;	
	}