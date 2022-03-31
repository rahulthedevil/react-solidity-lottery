var argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const solc = require('solc');
const assert = require('assert');

assert(argv.contract, 'Contract needs to be specified. Usage: npm run compile -- --contract=Lottery');
const contractName = argv.contract;
const contractPath = path.resolve(__dirname, 'contracts', `${contractName}.sol`);
const binPath = path.resolve(__dirname, 'bin', 'contracts');

const source = fs.readFileSync(contractPath, 'utf-8').replace(/\r\n/g, "");
mkdirp.sync(binPath);

var compilerInput = `{
    "language": "Solidity",
    "sources": {
        "${contractName}.sol": {
            "content": "${source}"
        }
    },
    "settings": {
        "outputSelection": {
            "*": {
                "*": [ "*" ]
            }
        }
    }
}`

const compiledContracts = JSON.parse(solc.compile(compilerInput)).contracts[`${contractName}.sol`];

Object.keys(compiledContracts).forEach(contract => {
    // write the contract's interface definition and bytecode 
    fs.writeFileSync(path.resolve(binPath, `${contract}.json`), JSON.stringify(compiledContracts[contract], null, 2), 'utf-8');
    fs.writeFileSync(path.resolve(binPath, `${contract}.abi`), JSON.stringify(compiledContracts[contract].abi), 'utf-8');
    fs.writeFileSync(path.resolve(binPath, `${contract}.bin`), compiledContracts[contract].evm.bytecode.object, 'utf-8');
});