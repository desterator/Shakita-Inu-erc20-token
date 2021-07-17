pragma solidity 0.8.6;

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}