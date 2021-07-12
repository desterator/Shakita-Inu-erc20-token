module.exports = {
  networks: {
    development: {
      provider: () => new HDWalletProvider(mnemonic, `http://127.0.0.1:8545`),
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 6721975,
      gasLimit: 6721975,
      gasPrice: 1
    },
  },
  compilers: {
    solc: {
      version: '0.8.6',
      docker: false,
      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    },
  },
};