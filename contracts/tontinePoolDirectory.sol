pragma solidity ^0.4.16;

import "./tontinePool.sol";

contract TontinePoolDirectory {
    
    address public owner;
    mapping(address => address[]) public user2OwnedPools;
    
    
    
    function TontinePoolDirectory() {
        owner = msg.sender;
    }
    
    
    
    function addPool(address poolAddress) public {
        TontinePool pool = TontinePool(poolAddress);
        require(pool.owner() == msg.sender);
        
        address[] storage pools = user2OwnedPools[msg.sender];
        if (!__inArray(pools, poolAddress)) {
            pools.push(poolAddress);
        }
    }
    
    
    
    function __inArray(address[] arr, address needle) private returns (bool) {
        for (uint i = 0; i < arr.length; i++) {
            if (needle == arr[i]) {
                return true;
            }
        }
        
        return false;
    }
    
    
    
    function getNumPools(address user) public constant returns (uint) {
        return user2OwnedPools[user].length;
    }
    
    
    
    function destroy() public {
        require(owner == msg.sender);
        selfdestruct(owner);
    }
    
}