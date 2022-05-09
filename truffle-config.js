require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/${process.env.INFURA_VERSION$}${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 3
  },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://rinkeby.infura.io/${process.env.INFURA_VERSION}${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
  },
    kovan: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://kovan.infura.io/${process.env.INFURA_VERSION$}${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 42
    }
  },  
  compilers: {
	solc: {
		version: "0.8.3",
		optimizer: {
			enabled: true,
			runs: 200
		}
	}
  }
}