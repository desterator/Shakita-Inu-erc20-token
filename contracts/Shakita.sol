pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Shakita is ERC20, Ownable {
    using SafeMath for uint256;

    bool public SalesTax;

    address constant public GameRewards = 0xC6606148830aE21118AD4055faaCEE8B125CCC0D;
    address constant public DevelopmentAndMarketing = 0xEBEf553c3BC93bB12653a34c90aC5361cDa19779;
    address constant public BuyBackAndBurn = 0x124915F02178008735ce980d5B807f0f31c0E3bd;

    mapping(address => bool) public whiteList;


    constructor(address _issuer) ERC20("Shakita Inu", "Shak") {
        // 9,999,999,999
        ERC20._mint(_issuer, 9999999999000000000000000000);

        whiteList[0x754ed2cba2Aea4DE3967f372864b3784B074FEfa] = true;
        whiteList[GameRewards] = true;
        whiteList[DevelopmentAndMarketing] = true;
        whiteList[BuyBackAndBurn] = true;
    }

    function setWhiteList(address _who, bool _value) external onlyOwner {
        whiteList[_who] = _value;
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

        // apply commission sanctions 6%
        uint256 _percent = amount.div(100);
        if (_percent == 0) {
            return;
        }

        ERC20._mint(GameRewards, _percent);
        ERC20._mint(DevelopmentAndMarketing, _percent.mul(2));
        ERC20._mint(BuyBackAndBurn, _percent.mul(3));
        ERC20._burn(to, _percent.mul(6));

        // apply anti whale sanctions
        // 666m
        require(ERC20.balanceOf(to) <= 666000000000000000000000000, "balanceExceedsLimit");
        // 333m
        require(amount <= 333000000000000000000000000, "amountExceedsLimit");
    }
}