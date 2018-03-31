pragma solidity ^0.4.16;

import "./strings.sol";
import "./intUtil.sol";

contract TontinePool {
    using strings for *;
    
    address[] public participants;
    
    // maps an address to an index of the participants array + 1 (0 is used for "not found")
    // used only for efficient lookup
    mapping(address => uint) public participantMap;
    
    address owner;
    bool useRandomOrdering = false;
    uint fixedPaymentAmountWei = 0;
    
    // used to avoid race conditions when changing the order of participants
    bool isOrderingLocked = false;
    
    enum State {
        REGISTRATION,
        PAYMENT_SUBMISSION,
        DISTRIBUTION
    }
    State public state = State.REGISTRATION;
    
    mapping(address => uint) public paymentsMade;
    uint public totalWei;
    uint public numParticipantsPaid;
    
    
    
    function TontinePool(bool _useRandomOrdering, uint _fixedPaymentAmountWei) public {
        owner = msg.sender;
        useRandomOrdering = _useRandomOrdering;
        fixedPaymentAmountWei = _fixedPaymentAmountWei;
    }
    
    
    
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }
    
    
    
    /* REGISTRATION state functions */
    
    
    
    modifier useOrderingLock() {
        require(!isOrderingLocked);
        isOrderingLocked = true;
        _;
        isOrderingLocked = false;
    }
    
    
    
    function addParticipant(address participant) public ownerOnly useOrderingLock {
        require(state == State.REGISTRATION);
        
        uint newLength = participants.push(participant);
        participantMap[participant] = newLength; // this is already index + 1
    }
    
    
    
    function removeParticipant(address participant) public ownerOnly useOrderingLock {
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
    
    
    
    /*
    // @param orderingStr
    //      Comma-delimited list mapping old indices to new indices
    function setParticipantOrdering(string orderingStr) public ownerOnly useOrderingLock {
        require(!useRandomOrdering);
        
        uint[] memory ordering = __orderingStr2Array(orderingStr);
        address[] oldIndex2Participant;
        address participant;
        uint newIndex;
        
        for (uint i = 0; i < participants.length; i++) {
            oldIndex2Participant[i] = participants[i];
        }
        
        for (i = 0; i < ordering.length; i++) {
            newIndex = ordering[i];
            participant = oldIndex2Participant[i];
            participants[newIndex] = participant;
            participantMap[participant] = newIndex;
        }
    }
    
    
    
    function __orderingStr2Array(string orderingStr) private returns (uint[]) {
        var s = orderingStr.toSlice();
        var delim = ",".toSlice();
        uint[] storage intParts;
        uint newIndex;
        intParts.length = 0;
        
        var parts = new string[](s.count(delim)+1);
        
        for (uint i = 0; i < parts.length; i++) {
            parts[i] = s.split(delim).toString();
            newIndex = intUtil.parseInt(parts[i], 10);
            require(newIndex >= 0 && newIndex < participants.length);
            intParts.push(newIndex);
        }
        
        return intParts;
    }
    */
    
    
    
    function closeRegistration() public ownerOnly useOrderingLock {
        state = State.PAYMENT_SUBMISSION;
    }
    
    
    
    /* PAYMENT_SUBMISSION state functions */
    
    
    
    modifier participantOnly() {
        require(participantMap[msg.sender] > 0);
        _;
    }
    
    
    function makePayment() public payable participantOnly {
        require(state == State.PAYMENT_SUBMISSION);
        
        __setPaymentsMadeState();
        if (numParticipantsPaid == participants.length) {
            state = State.DISTRIBUTION;
        }
        
        if (fixedPaymentAmountWei > 0) {
            require(msg.value == fixedPaymentAmountWei);
            require(paymentsMade[msg.sender] == 0); // don't double pay for fixed amounts
        }
        
        paymentsMade[msg.sender] += msg.value;
        totalWei += msg.value;
    }
    
    
    
    function __setPaymentsMadeState() private {
        if (paymentsMade[msg.sender] == 0) {
            numParticipantsPaid += 1;
        }
    }
    
    
    
    /* DISTRIBUTION state functions */
    
}