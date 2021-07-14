const Shakita = artifacts.require("Shakita");

module.exports = async function (deployer) {
  const ISSUER = "0xb89600B37fB1816416abD4625FDA029017f66B89";  
  await deployer.deploy(Shakita, ISSUER);
};