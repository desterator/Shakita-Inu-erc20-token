const Shakita = artifacts.require("Shakita");


module.exports = async function (deployer, network, accounts) {
  const owner = "0xb37f35631aC2A76a9c6594C3Cc6d914a1Fd170f6";

  await deployer.deploy(Shakita, owner);
  await (await Shakita.deployed()).transferOwnership(owner);
};