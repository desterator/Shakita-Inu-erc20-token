pragma solidity ^0.7.0;

interface IBEP20 {
    function balanceOf(address _account) external view returns(uint256);
    function approve(address _spender, uint256 _addedValue) external returns (bool);
}