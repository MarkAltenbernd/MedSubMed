//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;

/**************************************************************************\
* Author: Mark Altenbernd
*	2020-04-30 
*	This contract holds the single function that builds functionality of an
*	app by adding delegated functions to, replacing them in, or removing them from 
*	a facade.
\**************************************************************************/

import "./MSMState.sol";	

interface IERC1538 {
    function updateContract(address _delegate, string calldata _functionSignatures, string calldata updateMessage) external;
}
contract MedSubMed is IERC1538 {	
    event ContractUpdated(string message);
    event FunctionUpdated(bytes4 indexed functionId, address indexed oldDelegate, address indexed newDelegate, string functionSignature);

	MSMState internal sm;	//	A short mnemonic for State MedSubMed
	
    function updateContract(address _delegate, string calldata _functionSignatures, string calldata updateMessage) override external {
        require(msg.sender == sm.st.contractOwner, "Must own the contract.");
        // pos is first used to check the size of the delegate contract.
        // After that pos is the current memory location of _functionSignatures.
        // It is used to move through the characters of _functionSignatures
        uint256 pos;
        if(_delegate != address(0)) {
            assembly {
                pos := extcodesize(_delegate)
            }
            require(pos > 0, "_delegate address is not a contract and is not address(0)");
        }
        // creates a bytes vesion of _functionSignatures
        bytes memory signatures = bytes(_functionSignatures);
        // stores the position in memory where _functionSignatures ends.
        uint256 signaturesEnd;
        // stores the starting position of a function signature in _functionSignatures
        uint256 start;
        assembly {
            pos := add(signatures,32)
            start := pos
            signaturesEnd := add(pos,mload(signatures))
        }
        // the function id of the current function signature
        bytes4 funcId;
        // the delegate address that is being replaced or address(0) if removing functions
        address oldDelegate;
        // the length of the current function signature in _functionSignatures
        uint256 num;
        // the current character in _functionSignatures
        uint256 char;
        // the position of the current function signature in the funcSignatures array
        uint256 index;
        // the last position in the funcSignatures array
        uint256 lastIndex;
        // parse the _functionSignatures string and handle each function
        for (; pos < signaturesEnd; pos++) {
            assembly {char := byte(0,mload(pos))}
            if (char == 0x29) {		// 0x29 == ')', end of a func sig
                pos++;
                num = (pos - start);
                start = pos;
                assembly {
                    mstore(signatures,num)
                }
                funcId = bytes4(keccak256(signatures));
                oldDelegate = sm.st.delegates[funcId];
                if(_delegate == address(0)) {
                    index = sm.st.funcSignatureToIndex[signatures];
                    require(index != 0, "Function does not exist.");
                    index--;
                    lastIndex = sm.st.funcSignatures.length - 1;
                    if (index != lastIndex) {
                        sm.st.funcSignatures[index] = sm.st.funcSignatures[lastIndex];
                        sm.st.funcSignatureToIndex[sm.st.funcSignatures[lastIndex]] = index + 1;
                    }
					sm.st.funcSignatures.pop();
                    delete sm.st.funcSignatureToIndex[signatures];
                    delete sm.st.delegates[funcId];
                    emit FunctionUpdated(funcId, oldDelegate, address(0), string(signatures));
                }
                else if (sm.st.funcSignatureToIndex[signatures] == 0) {
                    require(oldDelegate == address(0), "FuncId clash.");
                    sm.st.delegates[funcId] = _delegate;
                    sm.st.funcSignatures.push(signatures);
                    sm.st.funcSignatureToIndex[signatures] = sm.st.funcSignatures.length;
                    emit FunctionUpdated(funcId, address(0), _delegate, string(signatures));
                }
                else if (sm.st.delegates[funcId] != _delegate) {
                    sm.st.delegates[funcId] = _delegate;
                    emit FunctionUpdated(funcId, oldDelegate, _delegate, string(signatures));
                }
                assembly {signatures := add(signatures,num)}
            }
        }
        emit ContractUpdated(updateMessage);
    }	//	function updateContract()
}	//	contract MedSubMed