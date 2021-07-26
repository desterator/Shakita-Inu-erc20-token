const Shakita = artifacts.require("Shakita");
const Router = artifacts.require("./interface/test/IPancakeRouter");
const Factory = artifacts.require("./interface/test/IPancakeFactory");
const IBEP20 = artifacts.require("./interface/test/IBEP20");

const Reverter = require("./helpers/reverter");
const truffleAssert = require("truffle-assertions");
const BigNumber = require('bignumber.js');

const toBN = (num) => {
  return new BigNumber(num);
};

contract("Shakita", async (accounts) => {
    const reverter = new Reverter(web3);

    let shakita;
    let router;
    let factory;
    let weth;
    let busd;

    const DEFAULT = accounts[0];
    const ALICE = accounts[2];

    
    const GameRewards = "0x8e2665836732d07b028a99E04d8366dffBe5d6a5";
    const NFTfarm = "0x4EeDF91ad3BAc5283C17Cb6fAba500aFBBfBAad8";
    const Marketing = "0x31Bc316792dB75854dC088a22dF7bD6024FA787c";
    const ShakitaFund = "0xA6fba96eF83d3180D5a97A0788A0f09609846Ff7";
    const Burn = "0xe55EB114834Ce47D787BAf776587381296BdE579";

    const deadline = "100000000000010000000000001000000000000";
    const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
    const busdAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";


    before("setup", async () => {
        shakita = await Shakita.new(DEFAULT);
        router = await Router.at(routerAddress);
        factory = await Factory.at(await router.factory());
        weth = await IBEP20.at(await router.WETH());
        busd = await IBEP20.at(busdAddress);

        await reverter.snapshot(); 
    });

    afterEach(reverter.revert);

    describe("constructor", async () => {
        it("should get correct emission", async () => {
            assert.equal("9999999999000000000000000000", (await shakita.balanceOf(DEFAULT)).toString());
        });
        it("should make right calculation of pair shakita busd", async() => {
            await factory.createPair(busdAddress, shakita.address);
            assert.equal(await shakita.pair(), await factory.getPair(busdAddress, shakita.address));
        });
    });
    describe("changeSalesTax", async () => {
        it("should change state", async () => {
            assert.isFalse(await shakita.SalesTax());

            await shakita.changeSalesTax();
            assert.isTrue(await shakita.SalesTax());

            await shakita.changeSalesTax();
            assert.isFalse(await shakita.SalesTax());
        });
    });
    describe("changeAtniWhale", async () => {
        it("should change state", async () => {
            assert.isFalse(await shakita.AtniWhale());

            await shakita.changeAtniWhale();
            assert.isTrue(await shakita.AtniWhale());

            await shakita.changeAtniWhale();
            assert.isFalse(await shakita.AtniWhale());
        });
    });
    describe("_afterTokenTransfer", async () => {
        it("should make transfer with commision", async () => {
            await shakita.changeSalesTax();
            await shakita.setWhiteList(DEFAULT, false);
            
            await shakita.transfer(ALICE, 100);
            assert.equal(90, (await shakita.balanceOf(ALICE)).toString());
            assert.equal(1, (await shakita.balanceOf(GameRewards)).toString());
            assert.equal(2, (await shakita.balanceOf(NFTfarm)).toString());
            assert.equal(3, (await shakita.balanceOf(Marketing)).toString());
            assert.equal(4, (await shakita.balanceOf(ShakitaFund)).toString());
        });
        it("should get exception, balance exceeds limit", async () => {
            await shakita.changeAtniWhale();
            await shakita.setWhiteList(DEFAULT, false);
            
            for(let i = 0; i < 10; ++i) {
                await shakita.transfer(ALICE, "30000000000000000000000000");
            }
            await truffleAssert.reverts(shakita.transfer(ALICE, "1"), "balanceExceedsLimit");
        });
        it("should get exception, amount exceeds limit", async () => {
            await shakita.changeAtniWhale();
            await shakita.setWhiteList(DEFAULT, false);

            await truffleAssert.reverts(shakita.transfer(ALICE, "30000000000000000000000001"), "amountExceedsLimit");
        });
    });
    describe("pacake router", async () => {
        // fast mock test, recheck it!!!
        it("should add liqudity, but shakita, then sell shakita", async () => {
            await shakita.changeSalesTax();
            await shakita.setWhiteList(DEFAULT, false);

            await busd.approve(router.address, "100000000000010000000000001000000000000");
            await shakita.approve(router.address, "100000000000010000000000001000000000000");

            await router.swapExactETHForTokens("1", 
                                    [weth.address, busdAddress],
                                    DEFAULT,
                                    deadline, {value: "10000000000000000000"});

            const amount = toBN("900000000000000000000");
            await router.addLiquidity(shakita.address,
                busd.address,
                amount,
                amount,
                amount,
                amount,
                DEFAULT,
                deadline);

            const pair = await factory.getPair(busdAddress, shakita.address);
            assert.equal(amount, (await busd.balanceOf(pair)).toString());
            // fee is 10%
            assert.equal(amount.minus(amount.dividedBy(10)), (await shakita.balanceOf(pair)).toString());

            let GameRewardsBalance = await shakita.balanceOf(GameRewards);
            let NFTfarmBalance = await shakita.balanceOf(NFTfarm);
            let MarketingBalance = await shakita.balanceOf(Marketing);
            let ShakitaFundBalance = await shakita.balanceOf(ShakitaFund);
            let BurnBalance = await shakita.balanceOf(Burn);

            //buy shakita
            await router.swapExactTokensForTokens("1000000000000000000",
                                                  "1",
                                                  [busd.address, shakita.address],
                                                  ALICE,
                                                  deadline);

            assert.isTrue(GameRewardsBalance < await shakita.balanceOf(GameRewards));
            assert.isTrue(NFTfarmBalance < await shakita.balanceOf(NFTfarm));
            assert.isTrue(MarketingBalance < await shakita.balanceOf(Marketing));
            assert.isTrue(ShakitaFundBalance < await shakita.balanceOf(ShakitaFund));
            assert.isTrue(BurnBalance.toString() === (await shakita.balanceOf(Burn)).toString());


            GameRewardsBalance = await shakita.balanceOf(GameRewards);
            NFTfarmBalance = await shakita.balanceOf(NFTfarm);
            MarketingBalance = await shakita.balanceOf(Marketing);
            ShakitaFundBalance = await shakita.balanceOf(ShakitaFund);
            BurnBalance = await shakita.balanceOf(Burn);

            //buy shakita 2
            await router.swapExactTokensForTokens("1000000000000000000",
                                                  "1",
                                                  [busd.address, shakita.address],
                                                  ALICE,
                                                  deadline);

            assert.isTrue(GameRewardsBalance < await shakita.balanceOf(GameRewards));
            assert.isTrue(NFTfarmBalance < await shakita.balanceOf(NFTfarm));
            assert.isTrue(MarketingBalance < await shakita.balanceOf(Marketing));
            assert.isTrue(ShakitaFundBalance < await shakita.balanceOf(ShakitaFund));
            assert.isTrue(BurnBalance.toString() === (await shakita.balanceOf(Burn)).toString());

            GameRewardsBalance = await shakita.balanceOf(GameRewards);
            NFTfarmBalance = await shakita.balanceOf(NFTfarm);
            MarketingBalance = await shakita.balanceOf(Marketing);
            ShakitaFundBalance = await shakita.balanceOf(ShakitaFund);
            BurnBalance = await shakita.balanceOf(Burn);

            // sell
            await router.swapExactTokensForTokensSupportingFeeOnTransferTokens("1000000000000000000",
                                                                               "1",
                                                                               [shakita.address, busd.address],
                                                                               ALICE,
                                                                               deadline);

            assert.isTrue(GameRewardsBalance < await shakita.balanceOf(GameRewards));
            assert.isTrue(NFTfarmBalance < await shakita.balanceOf(NFTfarm));
            assert.isTrue(MarketingBalance < await shakita.balanceOf(Marketing));
            assert.isTrue(BurnBalance < await shakita.balanceOf(Burn));
            assert.isTrue(ShakitaFundBalance.toString() === (await shakita.balanceOf(ShakitaFund)).toString());

            GameRewardsBalance = await shakita.balanceOf(GameRewards);
            NFTfarmBalance = await shakita.balanceOf(NFTfarm);
            MarketingBalance = await shakita.balanceOf(Marketing);
            ShakitaFundBalance = await shakita.balanceOf(ShakitaFund);
            BurnBalance = await shakita.balanceOf(Burn);

            // sell 2
            await router.swapExactTokensForTokensSupportingFeeOnTransferTokens("1000000000000000000",
                                                                               "1",
                                                                               [shakita.address, busd.address],
                                                                               ALICE,
                                                                               deadline);

            assert.isTrue(GameRewardsBalance < await shakita.balanceOf(GameRewards));
            assert.isTrue(NFTfarmBalance < await shakita.balanceOf(NFTfarm));
            assert.isTrue(MarketingBalance < await shakita.balanceOf(Marketing));
            assert.isTrue(BurnBalance < await shakita.balanceOf(Burn));
            assert.isTrue(ShakitaFundBalance.toString() === (await shakita.balanceOf(ShakitaFund)).toString());
        });
    });
});