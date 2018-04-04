pragma solidity ^0.4.16;

import "./tontinePool.sol";

/**
 * Each user may own zero or more pools. This contract keeps track of all users
 * that own pools and the pools that they own.
 */
contract TontinePoolDirectory {
    
    address public owner;

    /**
     * Call the getter to access the array of pools owned by the given user.
     */
    mapping(address => address[]) public user2OwnedPools;
    
    
    
    function TontinePoolDirectory() {
        owner = msg.sender;
    }
    
    
    
    /**
     * Adds a pool to the array of pools owned by the sender. Duplicate pools
     * will not be added.
     *
     * @param poolAddress
     */
    function addPool(address poolAddress) public {
        TontinePool pool = TontinePool(poolAddress);
        require(pool.owner() == msg.sender);
        
        address[] storage pools = user2OwnedPools[msg.sender];
        if (!__inArray(pools, poolAddress)) {
            pools.push(poolAddress);
        }
    }
    
    
    
    /**
     * Helper function to determine whether the given address is in the given
     * array of addresses.
     *
     * TODO Remove this function and provide an O(1) lookup for owner pools.
     *
     * @param arr
     * @param needle
     *
     * @returns
     *    `true` if `needle` was found in `arr`; `false` otherwise.
     */
    function __inArray(address[] arr, address needle) private returns (bool) {
        for (uint i = 0; i < arr.length; i++) {
            if (needle == arr[i]) {
                return true;
            }
        }
        
        return false;
    }
    
    
    
    /**
     * Returns the number of pools owned by the given user, as stored in `user2OwnedPools`.
     *
     * @param user
     *
     * @returns
     *    The number of pools owned.
     */
    function getNumPools(address user) public constant returns (uint) {
        return user2OwnedPools[user].length;
    }
    
    
    
    /**
     * Destroys the contract permanently. Can only be called by owner.
     */
    function destroy() public {
        require(owner == msg.sender);
        selfdestruct(owner);
    }
    
}