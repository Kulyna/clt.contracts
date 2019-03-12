var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "six burger smooth agent melt cliff margin thumb right fork cannon also";

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 4612388
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
            gas: 0xfffffffffff, // <-- Use this high gas value
            gasPrice: 0x01      // <-- Use this low gas price
        },
        rinkeby: {
            provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/SJNZXWlD8Ed9GGdD4pWl"),
            network_id: '*',
            gas: 4500000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};

