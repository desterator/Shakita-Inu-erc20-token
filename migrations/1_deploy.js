const Shakita = artifacts.require("Shakita");
const Router = artifacts.require("./interface/test/IPancakeRouter");
const Router = artifacts.require("./interface/test/IBEP20");


module.exports = async function (deployer) {
  const ISSUER = "0xb89600B37fB1816416abD4625FDA029017f66B89";
  const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

  await deployer.deploy(Shakita);
  const shakita = await Shakita.deployed();
  const router = await Router.at(routerAddress);
  const weth = await IBEP20.at(await router.WETH());
  await weth.approve(router.address);
  shakita.approve(router.address);
  
  await router.addLiquidity(shakita.address,
                            weth.address,
                            "1000000000000000000000",
                            "1000000000000000000000",
                            "1000000000000000000000",
                            "1000000000000000000000",
                            ISSUER,
                            "100000000000010000000000001000000000000");
};