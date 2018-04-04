pragma solidity ^0.4.16;

/**
 * This is a top-level directory used to look up the addresses for all
 * other already-deployed contracts for TontineBlock. The address of this
 * deployed contract should be the only address that any client application
 * needs to access any other relevant contract.
 */
contract TontineContractDirectory {
    
    address public owner;
    
    /**
     * Provides the mapping from contract name to address at which it is stored.
     * Calling the getter should be the only call that non-owners make to the
     * directory.
     */
    mapping(bytes32 => address) public contractName2Address;
    
    
    
    function TontineContractDirectory() {
        owner = msg.sender;
    }
    
    
    
    /**
     * This function updates the contract map. This can be used to add new contracts
     * as well as to add new versions of existing contracts (by overwriting the address
     * mapped to by the same name).
     * 
     * @param name Name of the contract; used later to look up the address.
     * @param addr Address where the contract is stored.
     */
    function updateContract(bytes32 name, address addr) {
        require(owner == msg.sender);
        contractName2Address[name] = addr;
    }
    
}