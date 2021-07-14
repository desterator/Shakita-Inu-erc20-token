const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = "";

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 6721975,
      gasLimit: 6721975,
      gasPrice: 1
    },
    bsc: {
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bscTestnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-2-s3.binance.org:8545/`),
      network_id: 97,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    bscscan: "",
  },
  compilers: {
    solc: {
      version: '0.8.6',
      docker: false,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};