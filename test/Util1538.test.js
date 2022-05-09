//	Import deployed addresses of MSM contracts 
const { atMSMFacade, atUtil1538 } = require('./MSMDeployedAddresses.js');

const MSMFacade = artifacts.require("MSMFacade");
const Util1538  = artifacts.require("Util1538");
const UtilMSM  = artifacts.require("UtilMSM");

const ts = require('../ma_modules/timestamp');
const ls = require('../ma_modules/trace');

require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3(process.env.LOCAL_URL);

contract('The MSMFacade Contract . . .', async (accounts) => { 
	//	Establish several important account defaults
	const DEFAULT_ACCOUNT = accounts[process.env.DEFAULT_ACCOUNT];	
	web3.eth.defaultAccount = DEFAULT_ACCOUNT;
	//	For instantiating Factories . . .
	const MSM_OWNER  = accounts[process.env.MSM_OWNER];
	let opts;
	opts = Object({from: MSM_OWNER});
	
	let msmFacade;

	try { 
		it(". . . initiates.", () => { 
			ls("CONTRACT START:\t" + ts());
		});
		it(". . . has access to " + accounts.length + " accounts.", async () => {
			assert.ok(accounts.length > 0);
		});
		it(". . . instantiates a Facade contract.", async () => {
			MSMFacade.abi = MSMFacade.abi.concat(Util1538.abi);
			MSMFacade.abi = MSMFacade.abi.concat(UtilMSM.abi);
			msmFacade = await MSMFacade.at(atMSMFacade, opts);
			assert.ok(msmFacade, "MSMFacade not ennewed()");
		});	
		it(". . . returns the number of delegated functions.", async () => {	
			const tot = await msmFacade.totalFunctions.call(opts);
			ls("\n\tThe number of delegated functions is " + tot);
		});	
/*		
		it(". . . returns info for a range of functions specified by index.", async () => {
			ls("\n\tDelegate Address, FuncID, and Signature");
			let tot = await msmFacade.totalFunctions.call(opts); 
			if (tot > 200) {	//	to prevent runaway loop on absurdly large array
				tot = 32;
			}
			for (let i = 0; i < tot; i += 1) {
				const funcRet = await msmFacade.functionByIndex.call(i, opts);
				ls("\t\t" + i + ":\t" + funcRet[2] + " hosts " + funcRet[1] + " : " + funcRet[0]);
			}
		});
		it(". . . tests whether a function with a specified signature exists as a delegated function.", async () => {
			const funcSig = "functionSignatures()";
			const exists = await msmFacade.functionExists.call(funcSig, opts);
			ls("\n\tThe statement 'the function " + funcSig + " exists' is essentially " + exists + ".");
		});
		
		it(". . . returns the address of the contract that hosts a function with a specified signature.", async () => {
			const funcSig = "functionSignatures()";
			const delAddr = await msmFacade.delegateAddress.call(funcSig, opts);
			ls("\n\t" + delAddr + " is the host for " + funcSig);
		});
		it(". . . calls the functionSignatures() function.", async () => { 
			const tot = await msmFacade.totalFunctions.call(opts);
			if (tot < 200) {	//	to prevent runaway loop on absurdly large array
				const sigsString = await msmFacade.functionSignatures.call(opts); 
				ls("\n\tThe concatenated signatures of the delegated functions follow:\n" + sigsString);
			} else {
				ls("\n\tThe funcSignatures[] array is absurdley long, so no concatenated string for you.");
			}
		});	//*/
/*
		it(". . . tests existence of functions of the UtilMSM contract.", async () => {
			ls("\n\tState variables returned by UtilMSM delegated functions.");
			const verSig = "getMSMVersion()";
			const titSig = "getMSMTitle()";
			const desSig = "getMSMDescription()";
			if (await msmFacade.functionExists.call(verSig, opts)) {
				ls("\t\tMSM Version = '" + await msmFacade.getMSMVersion.call(opts) + "'");
			}
			if (await msmFacade.functionExists.call(titSig, opts)) {
				ls("\t\tMSM Title = '" + await msmFacade.getMSMTitle(opts) + "'");
			}
			if (await msmFacade.functionExists.call(desSig, opts)) {
				ls("\t\tMSM Description = '" + await msmFacade.getMSMDescription(opts) + "'");
			}			
		});	
		it(". . . retrieves MSMName as set by UtilMSM.", async () => {
			const msmName = await msmFacade.returnMSMName.call(opts); 
			ls("\n\t\tMSMName = '" + msmName + "'");
		});//*/
		it(" . . . terminates.", () => { 
			ls("CONTRACT END:\t" + ts());
		});
	} catch (err) {
				ls('ERROR caught in MSMFacade tests:\n' + err);
	}
});