pragma solidity ^0.4.16;

contract TontinePool {
    
    address[] public participants;
    
    // maps an address to an index of the participants array + 1 (0 is used for "not found")
    // used only for efficient lookup
    mapping(address => uint) public participantMap;
    
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
    
    
    
    /* REGISTRATION state functions */
    
    
    
    function addParticipant(address participant) public requireOwner {
        require(state == State.REGISTRATION);
        
        uint newLength = participants.push(participant);
        participantMap[participant] = newLength; // this is already index + 1
    }
    
    
    
    function removeParticipant(address participant) public requireOwner {
        require(state == State.REGISTRATION);
        
        uint indexToRemove = participantMap[participant];
        require(indexToRemove > 0);
        
        address lastParticipant = participants[participants.length - 1];
        participants[indexToRemove] = lastParticipant;
        participants.length -= 1;
        
        // update the map for both participants
        participantMap[lastParticipant] = indexToRemove + 1;
        participantMap[participant] = 0;
    }
    
    
    
    function getNumberOfParticipants() public constant returns (uint) {
        return participants.length;
    }
    
    
    
    function closeRegistration() public requireOwner() {
        state = State.PAYMENT_SUBMISSION;
    }
    
}