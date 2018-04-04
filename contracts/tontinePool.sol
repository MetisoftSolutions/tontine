pragma solidity ^0.4.16;

import "./strings.sol";
import "./intUtil.sol";
import "./uniqueToken.sol";

contract TontinePool {
    using strings for *;
    
    address[] public participants;
    
    // maps an address to an index of the participants array + 1 (0 is used for "not found")
    // used only for efficient lookup
    mapping(address => uint) public participantMap;
    
    address public owner;
    
    bool public useRandomOrdering = false;
    uint public fixedPaymentAmountWei = 0;
    bool public useErc721 = false;
    bool public useSinglePayment = false;
    
    address public erc721Master;
    
    // used to avoid race conditions when changing the order of participants
    bool isOrderingLocked = false;
    
    enum State {
        REGISTRATION,
        MINTING_TOKENS,
        PAYMENT_SUBMISSION,
        DISTRIBUTION
    }
    State public state = State.REGISTRATION;
    
    mapping(address => uint) public paymentsMade;
    uint public totalWei;
    uint public numParticipantsPaid;
    mapping(address => uint) public pending721Withdrawals;
    
    
    
    function TontinePool(bool _useRandomOrdering, uint _fixedPaymentAmountWei, bool _useErc721, bool _useSinglePayment) public {
        owner = msg.sender;
        useRandomOrdering = _useRandomOrdering;
        fixedPaymentAmountWei = _fixedPaymentAmountWei;
        useErc721 = _useErc721;
        useSinglePayment = _useSinglePayment;   
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
        state = State.MINTING_TOKENS;
        
        if (useErc721) {
            __createErc721Token();
            __mintTokens();
        }
        
        state = State.PAYMENT_SUBMISSION;
    }
    
    
    
    function __createErc721Token() private {
        erc721Master = new UniqueToken("test", "TEST");
    }
    
    
    
    function __mintTokens() private {
        // If a fixed payment amount was set, then each user will end up getting one token.
        // Otherwise, we will mint 100 tokens and give each user a number of them based on percentage stake in the pool.
        uint numTokens = 100;
        
        if (fixedPaymentAmountWei > 0) {
            numTokens = participants.length;
        } else if (useSinglePayment) {
            numTokens = 1;
        }
        
        UniqueToken uniqueToken = UniqueToken(erc721Master);
        uniqueToken.mint(numTokens);
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
        
        if (state == State.DISTRIBUTION) {
            if (!useSinglePayment) {
                __calcWithdrawalTokens();
            } else {
                __chooseWinner();
            }
        }
    }
    
    
    
    function __setPaymentsMadeState() private {
        if (paymentsMade[msg.sender] == 0) {
            numParticipantsPaid += 1;
        }
    }
    
    
    
    /* DISTRIBUTION state functions */
    
    
    
    function __calcWithdrawalTokens() private {
        uint participantPayment;
        uint percentage;
        
        for (uint i = 0; i < participants.length; i++) {
            participantPayment = paymentsMade[participants[i]];
            percentage = (participantPayment * 100) / totalWei;
            pending721Withdrawals[participants[i]] = percentage;
        }
    }
    
    
    
    function withdraw() public participantOnly {
        uint amount = pending721Withdrawals[msg.sender];
        
        if (amount > 0) {
            pending721Withdrawals[msg.sender] = 0;
            msg.sender.transfer(amount);
        }
    }
    
    
    
    function __chooseWinner() private {
        
    }
    
}