pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Shakita is ERC20, Ownable {
    constructor() public ERC20("Shakita Inu", "Shak") {
        // 9,999,999,999
        ERC20._mint(msg.sender, 9999999999000000000000000000);
    }

    function burn(uint256 _amount) external {
        ERC20._burn(msg.sender, _amount);
    }
}