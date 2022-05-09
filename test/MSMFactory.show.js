//	Import deployed addresses of MSM contracts 
const { atMSMFactory } = require('./MSMDeployedAddresses.js');

const MSMFactory = artifacts.require("MSMFactory");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
//Enable one of the following
const web3 = new Web3(process.env.LOCAL_URL);
//const web3 = new Web3(process.env.KOVAN_URL);
//const web3 = new Web3(process.env.RINKEBY_URL);
//const web3 = new Web3(process.env.ROPSTEN_URL);

contract('The MSMFactory Contract . . .', async (accounts) => { 	
	const DEFAULT_ACCOUNT = accounts[process.env.MSM_OWNER];
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	let opts = Object({from: DEFAULT_ACCOUNT});
	
	let msmFactory, facadeCount;

	try { 
		it(". . . has a number of important properties.", async () => {
			ls("CONTRACT START: " + ts());
			//	Instantiate the factory 
			msmFactory = await MSMFactory.at(atMSMFactory, opts);
			assert.ok(msmFactory, "MSMFactory not ennewed()");
			const factoryID = await msmFactory.getFactoryID.call(opts);
			ls("\tThe Factory's unique identifier: " + factoryID); 
			const factoryCreated = await msmFactory.getFactoryCreated.call(opts); 
			ls("\tThe Factory's timestamp:         " + factoryCreated);	
			const chainID = await msmFactory.getFactoryChainID.call(opts);
			ls("\tThe Factory resides on:          Chain #" + chainID); 
			facadeCount = await msmFactory.getDeployedMSMFacadeCount.call(opts);
			ls("\tNumber of deployed MSMFacades:   " + facadeCount);
			if (facadeCount > 0) {
				const facades = await msmFactory.getDeployedMSMFacades.call(opts);
				for (let i = 0; i < facades.length; i += 1) {
					ls("\t\t" + (i+1) + "\t" + facades[i]);
				}
			}
			ls("CONTRACT END: " + ts());
		});
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}	//	try-catch
});
		
