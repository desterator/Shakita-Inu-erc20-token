const Shakita = artifacts.require("Shakita");
const Router = artifacts.require("./interface/test/IPancakeRouter");
const IBEP20 = artifacts.require("./interface/test/IBEP20");


module.exports = async function (deployer, network, accounts) {
  const ISSUER = accounts[0];
  const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

  await deployer.deploy(Shakita, ISSUER);
  const shakita = await Shakita.deployed();
  const router = await Router.at(routerAddress);
  const weth = await IBEP20.at(await router.WETH());
  await weth.approve(router.address, "100000000000010000000000001000000000000");
  await weth.deposit({value: "90000000000000000000"});
  await shakita.approve(router.address, "100000000000010000000000001000000000000");
  
  
  await shakita.changeSalesTax(); // todo do we need change it now????

  await router.addLiquidity(shakita.address,
                            weth.address,
                            "90000000000000000000",
                            "90000000000000000000",
                            "90000000000000000000",
                            "90000000000000000000",
                            ISSUER,
                            "100000000000010000000000001000000000000");
};