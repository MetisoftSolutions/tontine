pragma solidity ^0.4.16;

contract TontinePool {
    
    address[] public participants;
    address owner;
    bool useRandomOrdering = false;
    
    enum State {
        REGISTRATION,
        PAYMENT_SUBMISSION,
        DISTRIBUTION
    }
    State state = State.REGISTRATION;
    
    
    
    function TontinePool(bool _useRandomOrdering) public {
        owner = msg.sender;
        useRandomOrdering = _useRandomOrdering;
    }
    
    
    
    modifier requireOwner() {
        require(owner == msg.sender);
        _;
    }
    
    
    
    function addParticipant(address participant) public requireOwner {
        require(state == State.REGISTRATION);
        participants.push(participant);
    }
    
    
    
    function removeParticipant(address participant) public requireOwner {
        require(state == State.REGISTRATION);
        uint indexToRemove;
        bool found = false;
        
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == participant) {
                indexToRemove = i;
                found = true;
                break;
            }    
        }
        
        if (found) {
            participants[indexToRemove] = participants[participants.length - 1];
            participants.length -= 1;
        }
    }
    
    
    
    function getNumberOfParticipants() public constant returns (uint) {
        return participants.length;
    }
    
    
    
    function closeRegistration() public requireOwner() {
        state = State.PAYMENT_SUBMISSION;
    }
    
}