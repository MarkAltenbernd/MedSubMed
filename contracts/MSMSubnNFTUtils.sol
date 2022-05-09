//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
	
import "./MSMKeys.sol";
import "./MSMModifiers.sol";	
import "./MSMDeployedAddresses.sol";
import "./MSMExoSkeleton.sol";
import "./UtilMSM.sol";
import "./MSMSubscriptionNFT.sol";
import "./Uint2String.sol";

interface IMSMSubnNFTUtils { 
//	function concat(string memory a, string memory b) internal pure returns (string memory)
	function getMSMSubnNFTAddr(uint256 _nftKey) external view returns (address);	
	function getMSMSubnNFT(uint256 _nftKey) external view returns (MSMSubscriptionNFT);	
	function getMSMSubnNFTProps(uint256 _nftKey) external view 		
				returns (string memory, string memory, uint256, uint256);	
	function getMSMSubnNFTCount() external view returns(uint256); 
	function getSubnNFTKeys() external view returns (uint256[] memory); 
}

contract MSMSubnNFTUtils is IMSMSubnNFTUtils, MSMModifiers, MSMDeployedAddresses, MSMExoSkeleton { 
	using Uint2String for uint256;

	event	msmSubnNFTRemoved(address indexed nftAddress, uint256 nftKey, uint256 subnKey); 
	
//	EXTERNAL 
	function getMSMSubnNFTAddr(uint256 _nftKey) override external view 	returns (address) { 
		address nftAddress_     = sm.nftAddrs[_nftKey];			//	Use key to get address
		return (nftAddress_);
	} 
	function getMSMSubnNFT(uint256 _nftKey) override external view returns (MSMSubscriptionNFT) { 
		address nftAddress      = sm.nftAddrs[_nftKey];			//	Use key to get address
		MSMSubscriptionNFT nft_ = MSMSubscriptionNFT(nftAddress);	//	Get contract instance
		
		return(nft_);
	}	
	function getMSMSubnNFTProps(uint256 _nftKey) override external view 
		returns (string memory, string memory, uint256, uint256) { 
		address nftAddress       = sm.nftAddrs[_nftKey]; 
		if (nftAddress == address(0x0)) {
			return ("There is no NFT with the specified key.", "Missing NFT", 0x0, _nftKey);
		}
		MSMSubscriptionNFT nft   = MSMSubscriptionNFT(nftAddress);	//	Get contract instance
		string memory   nftName_ = nft.name(); 
		string memory nftSymbol_ = nft.symbol();
		uint256         subnKey_ = nft.subnKey();
		uint256          nftKey_ = nft.nftKey();
		require(_nftKey == nftKey_, "Whoops! Input key and retrieved key are not of the same value.");
		return(nftName_, nftSymbol_, subnKey_, nftKey_);
	}
	function getMSMSubnNFTCount() override external view returns(uint256) {
		return  sm.nftKeys.length;
	}
	function getSubnNFTKeys() external view returns (uint256[] memory) {
			return sm.nftKeys;
	}
}