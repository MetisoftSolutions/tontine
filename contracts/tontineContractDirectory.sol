pragma solidity ^0.4.16;

contract TontineContractDirectory {
    address public owner;
    mapping(string => address) public contractName2Address;
    
    
    
    function TontineContractDirectory() {
        owner = msg.sender;
    }
    
    
    
    function updateContract(string name, address addr) {
        require(owner == msg.sender);
        contractName2Address[name] = addr;
    }
}