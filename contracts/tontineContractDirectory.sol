pragma solidity ^0.4.16;

contract TontineContractDirectory {
    
    address public owner;
    mapping(bytes32 => address) public contractName2Address;
    
    
    
    function TontineContractDirectory() {
        owner = msg.sender;
    }
    
    
    
    function updateContract(bytes32 name, address addr) {
        require(owner == msg.sender);
        contractName2Address[name] = addr;
    }
    
}