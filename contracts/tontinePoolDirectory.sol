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
     * Used when you want a list of all pools the user owns.
     */
    mapping(address => address[]) public user2OwnedPools;
    
    /**
     * Maps (the owner of a pool) to a mapping of (a pool address) to (true).
     * Used when you want to verify that a given user owns a given pool.
     */
    mapping(address => mapping(address => bool)) public user2OwnedPoolsMap;

    /**
     * Call the getter to access the array of pools in which the user is a participant.
     */
    mapping(address => address[]) public participant2Pools;

    /**
     * Maps (the participant of a pool) to a mapping of (a pool address) to (index of participants2Pools + 1).
     * Used when you want to verify that a given user is participating in a given pool.
     * A value of 0 represents non existence.
     */
    mapping(address => mapping(address => uint)) public participant2PoolsMap;
    
    
    
    function TontinePoolDirectory() {
        owner = msg.sender;
    }
    
    
    
    /**
     * Adds a pool to the array of pools owned by the sender. Duplicate pools
     * will not be added.
     */
    function addPoolForOwner(address poolAddress) public {
        TontinePool pool = TontinePool(poolAddress);
        require(pool.owner() == msg.sender);

        if (!user2OwnedPoolsMap[msg.sender][poolAddress]) {
            user2OwnedPools[msg.sender].push(poolAddress);
            user2OwnedPoolsMap[msg.sender][poolAddress] = true;
        }
    }



    /**
     * Adds a pool to the array of pools the participant is participating in.
     * Duplicate pools will not be added.
     */
    function addPoolForParticipant(address poolAddress, address participant) public {
        TontinePool pool = TontinePool(poolAddress);
        require(pool.owner() == msg.sender);

        if (participant2PoolsMap[participant][poolAddress] == 0) {
            uint newLength = participant2Pools[participant].push(poolAddress);
            // newLength is index + 1. We want that, because we'll use 0 to represent no index.
            participant2PoolsMap[participant][poolAddress] = newLength;
        }
    }



    function removePoolForParticipant(address poolAddress, address participant) public {
        TontinePool pool = TontinePool(poolAddress);
        require(pool.owner() == msg.sender);

        uint indexPlusOne = participant2PoolsMap[participant][poolAddress];
        uint length = participant2Pools[participant].length;

        if (indexPlusOne > 0) {
            if (length > 1) {
                participant2Pools[participant][indexPlusOne-1] = participant2Pools[participant][length - 1];
                // update the map for the address that filled the gap
                address replacementAddress = participant2Pools[participant][indexPlusOne-1];
                participant2PoolsMap[participant][replacementAddress] = indexPlusOne;
            }
            participant2Pools[participant].length = length - 1;
            participant2PoolsMap[participant][poolAddress] = 0;
        }
    }
    
    
    
    /**
     * Returns the number of pools owned by the given user, as stored in `user2OwnedPools`.
     *
     * @return The number of pools owned.
     */
    function getNumOwnedPools(address user) public constant returns (uint) {
        return user2OwnedPools[user].length;
    }



    /**
     * Returns the number of pools the given user is participating in, as stored in
     * `participant2Pools`.
     *
     * @return The number of pools owned.
     */
    function getNumParticipantPools(address user) public constant returns (uint) {
        return participant2Pools[user].length;
    }
    
    
    
    /**
     * Destroys the contract permanently. Can only be called by owner.
     */
    function destroy() public {
        require(owner == msg.sender);
        selfdestruct(owner);
    }
    
}