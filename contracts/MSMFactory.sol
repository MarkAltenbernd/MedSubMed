//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
*	 Author: 	Mark Altenbernd
*	A factory to create contracts that comply with ERC1538
\******************************************************************************/

contract MSMFactory {
    
	address payable private owner;
	address payable private manager;
    address [] private deployedMSMFacades;
	uint private factoryID;	
	uint private factoryCreated; 
	uint private factoryChainID; 
	
	event MSMFactoryCreated(address indexed newMSMFactory, address indexed newMSMOwner, uint factoryID, uint factoryCreated);
	event MSMFacadeCreated(address indexed newMSMFacade, address indexed owner, address indexed manager, uint256 factoryID, uint256 serNum);
    
	constructor () { 
		owner   = payable(msg.sender);
		manager = payable(msg.sender);
		factoryID = block.number; 
		factoryCreated = block.timestamp; 
		factoryChainID = block.chainid; 
		
		emit MSMFactoryCreated(address(this), owner, factoryID, factoryCreated); 
									// 'this' is this MSMFactory contract
	}
     function createMSMFacade() public returns (address) {
		uint256 seqNum_ = deployedMSMFacades.length; 
		seqNum_ += 1; 
        address newMSMFacade = address(new MSMFacade(owner, manager, factoryID, seqNum_));
        deployedMSMFacades.push(newMSMFacade); 
		emit MSMFacadeCreated(newMSMFacade, owner, manager, factoryID, seqNum_);
		return newMSMFacade;      
    }
    function getDeployedMSMFacades() public view returns (address[] memory) {
        return deployedMSMFacades;
    }
    function getDeployedMSMFacadeCount() public view returns (uint) {
        return deployedMSMFacades.length;
    }
	function getFactoryID() public view returns(uint) {
		return factoryID; 
	}
	function getFactoryCreated() public view returns(uint) {
		return factoryCreated;
	}
	function getFactoryChainID() public view returns (uint) {
		return factoryChainID; 
	}
}	//	contract MSMFactory

//================================================================//

import "./MSMState.sol";			//	Includes types definitions	
import "./MSMDeployedAddresses.sol";

contract MSMFacade is MSMDeployedAddresses { 

	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
		
	MSMState	sm;	

    constructor(address payable _owner, address payable _mngr, uint256 _factoryID, uint256 _seqNum) {	
	
		address medSubMedAddr = atMedSubMed; 
		
		sm.st.contractOwner = _owner;			//	Legacy for use by MedSubMed contract only
        sm.msmOwner = _owner;					//	Used by all others
		
		Manager memory msmMngr;					
		msmMngr.mngrAddress = _mngr;
		msmMngr.mngrActive = true;
		sm.mngrMap[msmMngr.mngrAddress] = msmMngr;
		sm.mngrAddrs.push(msmMngr.mngrAddress);	//	The first Manager for a new Facade
		
		sm.factoryID = _factoryID;	
		sm.facadeSequenceNumber = _seqNum; 
		
        emit OwnershipTransferred(address(0), sm.msmOwner);

        //Adding ERC1538 updateContract function
        bytes memory signature = "updateContract(address,string,string)";
        bytes4 funcId = bytes4(keccak256(signature));
        sm.st.delegates[funcId] = medSubMedAddr;
        sm.st.funcSignatures.push(signature);
        sm.st.funcSignatureToIndex[signature] = sm.st.funcSignatures.length;
    }
    fallback() external payable {
        address delegate = sm.st.delegates[msg.sig]; 
        require(delegate != address(0), "Function does not exist in facade's fallback().");
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), delegate, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default {return (ptr, size)}
        }
    }
	receive() external payable{}
}	//	contract MSMFacade