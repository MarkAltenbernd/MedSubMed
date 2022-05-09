//	SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
pragma abicoder v2;
	
import "./Uint2String.sol";
import "../ERC721/ERC721.sol";	
import "../ERC721/ERC721Burnable.sol";
import "../ERC721/Ownable.sol";	

contract MSMSubscriptionNFT is ERC721, ERC721Burnable, Ownable {
	using Uint2String for uint256;
	
	uint256 private subnKey_;
	uint256 private nftKey_;
	
	constructor (string memory _name, string memory _symbol, uint256 _subnKey, uint256 _nftKey) 
		ERC721 (_name, _symbol) 
	{  		
		subnKey_ = _subnKey;
		nftKey_ = _nftKey;
	}
	function subnKey() public view returns (uint256) {
		return subnKey_;
	}
	function nftKey() public view returns (uint256) {
		return nftKey_;
	}
	function mint(address to, uint256 tokenId) public {
		_mint(to, tokenId);
	}
}	//	contract MSMSubscriptionNFT