pragma solidity 0.8.6;

interface IBEP20 {
    function deposit() external payable;
    function balanceOf(address _account) external view returns(uint256);
    function approve(address _spender, uint256 _addedValue) external returns (bool);
}