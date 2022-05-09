//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Author:		Mark Altenbernd 
\******************************************************************************/

import "./MSMState.sol"; 

contract MSMModifiers  {	
	//	CRITICAL: This is the global state for the MSM DApp
	//	All contracts must extend MSMModifiers, even if they do not
	//	use modifiers, in order to access the same, shared state. 
	MSMState sm;	
	
//	MODIFIERS
	modifier ownerOnly { 
		require(tx.origin == sm.msmOwner, "Invalid Query");
		_;
	}
	modifier managerOnly {
		require(tx.origin == sm.msmOwner || 
				sm.mngrMap[tx.origin].mngrActive, 
				"*** Available to an MSM Manager only ***");
		_;
	}
	modifier publisherOnly {
		//	Verify visitor is a Publisher
		require(tx.origin ==  sm.msmOwner || 
				sm.pubrMap[tx.origin].pubrActive,
				"*** Available to the registered Publisher only ***");
		_;
	}
	modifier managerOrPublisher {
		require(tx.origin == sm.msmOwner || 
				sm.mngrMap[tx.origin].mngrActive || 
				sm.pubrMap[tx.origin].pubrActive,
				"*** Available only to registered Publisher or MSM Manager. ***"); 
		_;
	}
	modifier subscriberOnly {
		require (tx.origin == sm.msmOwner ||
				sm.mngrMap[tx.origin].mngrActive ||
				sm.subrMap[tx.origin].subrActive, 
				"*** Available to an active Subscriber only. ***");
		_;
	}
}	//	contract MSMModifiers