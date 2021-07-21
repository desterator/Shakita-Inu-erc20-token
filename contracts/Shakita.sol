pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Shakita is ERC20, Ownable {
    using SafeMath for uint256;

    bool public SalesTax;

    address constant public GameRewards = 0x8e2665836732d07b028a99E04d8366dffBe5d6a5;
    address constant public NFTfarm = 0x4EeDF91ad3BAc5283C17Cb6fAba500aFBBfBAad8;
    address constant public Marketing = 0x31Bc316792dB75854dC088a22dF7bD6024FA787c;
    address constant public ShakitaFund = 0xA6fba96eF83d3180D5a97A0788A0f09609846Ff7;
    address constant public Burn = 0xe55EB114834Ce47D787BAf776587381296BdE579;


    mapping(address => bool) public whiteList;
    mapping(address => bool) public sellList;


    constructor(address _issuer) ERC20("Shakita Inu", "Shak") {
        // 9,999,999,999
        ERC20._mint(_issuer, 9999999999000000000000000000);

        whiteList[_issuer] = true;
        whiteList[GameRewards] = true;
        whiteList[NFTfarm] = true;
        whiteList[Marketing] = true;
        whiteList[ShakitaFund] = true;
        whiteList[Burn] = true;
    }

    function setWhiteList(address _who, bool _value) external onlyOwner {
        whiteList[_who] = _value;
    }

    function setSellList(address _who, bool _value) external onlyOwner {
        sellList[_who] = _value;
    }

    function burn(uint256 _amount) external {
        ERC20._burn(msg.sender, _amount);
    }

    function changeSalesTax() external onlyOwner {
        SalesTax = !SalesTax;
    }

    // make tax for transfers, make anti whale
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override virtual {
        if (!SalesTax) {
            return;
        }

        // no tax and anti whale for whiteList
        if(whiteList[from]) {
            return;
        }

        // no fee for mint and burn action
        if(from == address(0) || to == address(0)) {
            return;
        }

        // apply commission sanctions 10%
        uint256 _percent = amount.div(100);
        if (_percent == 0) {
            return;
        }

        ERC20._mint(GameRewards, _percent);
        ERC20._mint(NFTfarm, _percent.mul(2));
        ERC20._mint(Marketing, _percent.mul(3));
        // means sell on pancake router
        if(sellList[to]) {
            ERC20._mint(Burn, _percent.mul(4));
        } else {
            ERC20._mint(ShakitaFund, _percent.mul(4));
        }
        ERC20._burn(to, _percent.mul(10));

        // apply anti whale sanctions
        // because admins can have more then limit
        if(whiteList[to]) {
            return;
        }
        // 300m
        require(ERC20.balanceOf(to) <= 300000000000000000000000000, "balanceExceedsLimit");
        // 30m
        require(amount <= 30000000000000000000000000, "amountExceedsLimit");
    }
}