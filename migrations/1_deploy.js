const Shakita = artifacts.require("Shakita");
const Router = artifacts.require("./interface/test/IPancakeRouter");
const Factory = artifacts.require("./interface/test/IPancakeFactory");
const IBEP20 = artifacts.require("./interface/test/IBEP20");


module.exports = async function (deployer, network, accounts) {
  const GameRewards = "0xC6606148830aE21118AD4055faaCEE8B125CCC0D";
  const Dev = "0xEBEf553c3BC93bB12653a34c90aC5361cDa19779";
  const Burn = "0x124915F02178008735ce980d5B807f0f31c0E3bd";

  const ISSUER = accounts[0];
  const ALICE = accounts[2];
  const deadline = "100000000000010000000000001000000000000";
  const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

  await deployer.deploy(Shakita, ISSUER);
  const shakita = await Shakita.deployed();
  const router = await Router.at(routerAddress);
  const factory = await Factory.at(await router.factory());
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
                            deadline);

  const pair = await factory.getPair(weth.address, shakita.address);

  console.log("bnb in pair", (await weth.balanceOf(pair)).toString());
  console.log("shakita in pair", (await shakita.balanceOf(pair)).toString());

  console.log("=======================================");
  console.log("before buy")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  await router.swapExactETHForTokens("1", 
                                     [weth.address, shakita.address],
                                     ALICE,
                                     deadline, {value: "1000000000000000000"});

  console.log("after buy")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  console.log("alice(buyer)", (await shakita.balanceOf(ALICE)).toString());
  await router.swapExactETHForTokens("1", 
                                     [weth.address, shakita.address],
                                     ALICE,
                                     deadline, {value: "1000000000000000000"});
  console.log("after buy2")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  console.log("alice(buyer)", (await shakita.balanceOf(ALICE)).toString());


  console.log("=======================================");
  console.log("before sell")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  console.log("issuer(seller)", (await shakita.balanceOf(ISSUER)).toString());
  await router.swapExactTokensForETHSupportingFeeOnTransferTokens("1000000000000000000",
                                                                  "1",
                                                                  [shakita.address, weth.address],
                                                                  ISSUER,
                                                                  deadline);
  console.log("after sell")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  console.log("issuer(seller)", (await shakita.balanceOf(ISSUER)).toString());

  await router.swapExactTokensForETHSupportingFeeOnTransferTokens("1000000000000000000",
                                                                  "1",
                                                                  [shakita.address, weth.address],
                                                                  ISSUER,
                                                                  deadline);
  console.log("after sell2")
  console.log("game reward", (await shakita.balanceOf(GameRewards)).toString());
  console.log("dev", (await shakita.balanceOf(Dev)).toString());
  console.log("burn", (await shakita.balanceOf(Burn)).toString());
  console.log("issuer(seller)", (await shakita.balanceOf(ISSUER)).toString());
                                                            
  
};