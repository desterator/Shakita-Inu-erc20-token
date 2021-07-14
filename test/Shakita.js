const Shakita = artifacts.require("Shakita");

const Reverter = require("./helpers/reverter");
const truffleAssert = require("truffle-assertions");

contract("Shakita", async (accounts) => {
    const reverter = new Reverter(web3);

    let shakita;

    const DEFAULT = accounts[0];
    const ALICE = accounts[1];

    const GameRewards = "0xC6606148830aE21118AD4055faaCEE8B125CCC0D";
    const Dev = "0xEBEf553c3BC93bB12653a34c90aC5361cDa19779";
    const Burn = "0x124915F02178008735ce980d5B807f0f31c0E3bd";

    before("setup", async () => {
        shakita = await Shakita.new(DEFAULT);
        await reverter.snapshot(); 
    });

    afterEach(reverter.revert);

    describe("constructor", async () => {
        it("should get correct emission", async () => {
            assert.equal("9999999999000000000000000000", (await shakita.balanceOf(DEFAULT)).toString());
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
    describe("_afterTokenTransfer", async () => {
        it("should make transfer with commision", async () => {
            await shakita.changeSalesTax();
            
            await shakita.transfer(ALICE, 100);
            assert.equal(94, (await shakita.balanceOf(ALICE)).toString());
            assert.equal(1, (await shakita.balanceOf(GameRewards)).toString());
            assert.equal(2, (await shakita.balanceOf(Dev)).toString());
            assert.equal(3, (await shakita.balanceOf(Burn)).toString());
        });
        it("should get exception, balance exceeds limit", async () => {
            await shakita.changeSalesTax();
            
            await shakita.transfer(ALICE, "333000000000000000000000000");
            await shakita.transfer(ALICE, "333000000000000000000000000");
            await truffleAssert.reverts(shakita.transfer(ALICE, "333000000000000000000000000"), "balanceExceedsLimit");
        });
        it("should get exception, amount exceeds limit", async () => {
            await shakita.changeSalesTax();
            await truffleAssert.reverts(shakita.transfer(ALICE, "333000000000000000000000001"), "amountExceedsLimit");
        });
    });
});