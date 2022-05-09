//	Import addresses of deployed MSM contracts 
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
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	//	. . . and creating Facades
	const MSM_MANAGER = accounts[process.env.MSM_MANAGER];
	let opts;
	opts = Object({from: MSM_OWNER});
	
	let msmFactory, msmFacade;
	
	try { 
/*		
		it(". . . has access to " + accounts.length + " accounts.", async () => {
			ls("\n\tThe default account is " + web3.eth.defaultAccount);
			ls(  "\tThe MSM_OWNER       is " + MSM_OWNER);
			ls(  "\tThe MSM_MANAGER     is " + MSM_MANAGER);
			assert.ok(accounts.length > 0, "There are NO available accounts.");
		});	//*/
		it(". . . uses the Factory to create an MSMFacade.", async () => { 
			ls("CONTRACT START:\t" + ts());
			opts = Object({from: MSM_OWNER});
			msmFactory = await MSMFactory.at(atMSMFactory, opts);
			assert.equal(atMSMFactory, msmFactory.address, "MSMFactory not found at " + atMSMFactory);
			opts = Object({from: MSM_MANAGER});
			msmFacade = await msmFactory.createMSMFacade(opts);
			assert.ok(msmFacade, "Factory failed fabricating Facade.");
			ls("\n\tFacade Created:" + 
				"\n\t        Facade #\t" + msmFacade.logs[0].args.serNum + 
				"\n\t    from Factory\t" + msmFacade.logs[0].args.factoryID + 
				"\n\t\t   deployed to\t" + msmFacade.logs[0].args.newMSMFacade + 
				"\n\t\t      owned by\t" + msmFacade.logs[0].args.owner +
				"\n\t\tand managed by\t" + msmFacade.logs[0].args.manager);
			ls("CONTRACT END:\t" + ts());
		});	
	} catch (err) {
				ls('ERROR caught in MSMFacade creation process:\n' + err);
	}	//	try-catch
});