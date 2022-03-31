var argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const fs = require('fs');
const config = require('./config');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const assert = require('assert');

assert(argv.contract, 'Contract needs to be specified. Usage: npm run deploy -- --contract=Lottery');
const contractName = argv.contract;
const binPath = path.resolve(__dirname, 'bin', 'contracts');

const { abi, evm: { bytecode: { object } } } = JSON.parse(fs.readFileSync(path.resolve(binPath, `${contractName}.json`), 'utf-8'));

const provider = new HDWalletProvider(config.mnemonic, config.provider_uri);
const web3 = new Web3(provider);

let contract;

const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Attempting to deploy contract from Account: ' + accounts[0]);
    
        if(argv.arguments) {
            contract = await new web3.eth.Contract(abi)
            .deploy({ data: '0x' + object, arguments: [argv.arguments] })
            .send({ from: accounts[0], gas: 3000000 });
        } else {
            contract = await new web3.eth.Contract(abi)
            .deploy({ data: '0x' + object })
            .send({ from: accounts[0], gas: 3000000 });
        }
        console.log('Contract deployed to address: ' + contract.options.address);
    } 
    catch(e) {
        console.log(e);
    }    
};

deploy();