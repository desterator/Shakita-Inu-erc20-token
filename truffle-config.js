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