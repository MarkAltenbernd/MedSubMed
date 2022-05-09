//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/******************************************************************************\
* Contains functions for retrieving function signatures and delegate contract
* addresses.
/******************************************************************************/

import "./MSMState.sol";

interface IUtil1538 {
    function totalFunctions() external view returns(uint256);
    function functionByIndex(uint256 _index) external view returns(string memory functionSignature, bytes4 functionId, address delegate);
    function functionExists(string calldata _functionSignature) external view returns(bool);
    function functionSignatures() external view returns(string memory);
    function delegateFunctionSignatures(address _delegate) external view returns(string memory);
    function delegateAddress(string calldata _functionSignature) external view returns(address);
    function functionById(bytes4 _functionId) external view returns(string memory signature, address delegate);
    function delegateAddresses() external view returns(address[] memory);
	function signatureHash(string calldata _sig) external pure returns(bytes4);
	function signatureHashes() external view returns(bytes4[] memory);
}
contract Util1538 is IUtil1538 {
	
	MSMState	internal	sm; 
	
    function totalFunctions() override external view returns(uint256) {
        return sm.st.funcSignatures.length;
    }
    function functionByIndex(uint256 _index) override external view returns(string memory functionSignature, bytes4 functionId, address delegate) {
        require(_index < sm.st.funcSignatures.length, "functionSignatures index does not exist.");
        bytes memory signature = sm.st.funcSignatures[_index];
        functionId = bytes4(keccak256(signature));
        delegate = sm.st.delegates[functionId];
        return (string(signature), functionId, delegate);
    }
    function functionExists(string calldata _functionSignature) override external view returns(bool) {
        return sm.st.funcSignatureToIndex[bytes(_functionSignature)] != 0;
    }
    function functionSignatures() override external view returns(string memory) {
        uint256 signaturesLength;
        bytes memory signatures;
        bytes memory signature;
        uint256 functionIndex;
        uint256 charPos;
        uint256 funcSignaturesNum = sm.st.funcSignatures.length;
        bytes[] memory memoryFuncSignatures = new bytes[](funcSignaturesNum);
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = sm.st.funcSignatures[functionIndex];
            signaturesLength += signature.length;
            memoryFuncSignatures[functionIndex] = signature;
        }
        signatures = new bytes(signaturesLength);
        functionIndex = 0;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = memoryFuncSignatures[functionIndex];
            for(uint256 i = 0; i < signature.length; i++) {
                signatures[charPos] = signature[i];
                charPos++;
            }
        }
        return string(signatures);
    }
    function delegateFunctionSignatures(address _delegate) override external view returns(string memory) {
        uint256 funcSignaturesNum = sm.st.funcSignatures.length;
        bytes[] memory delegateSignatures = new bytes[](funcSignaturesNum);
        uint256 delegateSignaturesPos;
        uint256 signaturesLength;
        bytes memory signatures;
        bytes memory signature;
        uint256 functionIndex;
        uint256 charPos;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = sm.st.funcSignatures[functionIndex];
            if(_delegate == sm.st.delegates[bytes4(keccak256(signature))]) {
                signaturesLength += signature.length;
                delegateSignatures[delegateSignaturesPos] = signature;
                delegateSignaturesPos++;
            }
        }
        signatures = new bytes(signaturesLength);
        functionIndex = 0;
        for(; functionIndex < delegateSignatures.length; functionIndex++) {
            signature = delegateSignatures[functionIndex];
            if(signature.length == 0) {
                break;
            }
            for(uint256 i = 0; i < signature.length; i++) {
                signatures[charPos] = signature[i];
                charPos++;
            }
        }
        return string(signatures);
    }
    function delegateAddress(string calldata _functionSignature) override external view returns(address) {
        require(sm.st.funcSignatureToIndex[bytes(_functionSignature)] != 0, "Function signature not found.");
        return sm.st.delegates[bytes4(keccak256(bytes(_functionSignature)))];
    }
    function functionById(bytes4 _functionId) override external view returns(string memory, address) {
        for(uint256 i = 0; i < sm.st.funcSignatures.length; i++) {
            if(_functionId == bytes4(keccak256(sm.st.funcSignatures[i]))) {
                return (string(sm.st.funcSignatures[i]), sm.st.delegates[_functionId]);
            }
        }
		string memory errMsg = "Hash of input argument not found.";
		return(errMsg, address(0x00));
    }
    function delegateAddresses() override external view returns(address[] memory) {
        uint256 funcSignaturesNum = sm.st.funcSignatures.length;
        address[] memory delegatesBucket = new address[](funcSignaturesNum);
        uint256 numDelegates;
        uint256 functionIndex;
        bool foundDelegate;
        address delegate;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            delegate = sm.st.delegates[bytes4(keccak256(sm.st.funcSignatures[functionIndex]))];
            for(uint256 i = 0; i < numDelegates; i++) {
                if(delegate == delegatesBucket[i]) {
                    foundDelegate = true;
                    break;
                }
            }
            if(foundDelegate == false) {
                delegatesBucket[numDelegates] = delegate;
                numDelegates++;
            }
            else {
                foundDelegate = false;
            }
        }
        address[] memory delegates_ = new address[](numDelegates);
        functionIndex = 0;
        for(; functionIndex < numDelegates; functionIndex++) {
            delegates_[functionIndex] = delegatesBucket[functionIndex];
        }
        return delegates_;
    }
	function signatureHash(string calldata _sig) override external pure returns(bytes4) {
		return bytes4(keccak256(bytes(_sig)));
	}	
	function signatureHashes() override external view returns(bytes4[] memory) {
		string memory sig;
		bytes memory sigBytes;
		bytes4 hash;
		bytes4[] memory sigHashes;
		for (uint i = 0; i < sm.st.funcSignatures.length; i++) {
			sig = string(sm.st.funcSignatures[i]);
			sigBytes = abi.encode(sig); 
			hash = bytes4(keccak256(sigBytes));
			sigHashes[i] = hash;
		}
		return sigHashes;		
	}
}	//	contract Util1538
