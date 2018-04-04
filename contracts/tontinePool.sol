pragma solidity ^0.4.16;

import "./strings.sol";
import "./intUtil.sol";
import "./uniqueToken.sol";

contract TontinePool {
    using strings for *;
    
    address[] public participants;
    
    /**
     * Maps an address to an index of the participants array + 1 (0 is used for "not found").
     * Used only for efficient lookup.
     */
    mapping(address => uint) public participantMap;
    
    address public owner;
    
    bool public useRandomOrdering = false;

    /**
     * If set to a value greater than zero, each participant must make an exact payment of
     * this amount. Otherwise, each participant can make payments of any amount.
     */
    uint public fixedPaymentAmountWei = 0;

    /**
     * If `true`, ERC 721 tokens are generated when the contract reaches the `MINTING_TOKENS`
     * state. These tokens will then be given to participants during the `DISTRIBUTON` state.
     */
    bool public useErc721 = false;

    /**
     * If `true`, then a single payment will be made to the winner of the pot.
     * Otherwise, payments will be disbursed proportionally, usually using ERC 721 tokens.
     */
    bool public useSinglePayment = false;
    

    /**
     * In ERC 721 mode, this will store a reference to the deployed ERC 721 contract.
     */
    address public erc721Master;

    
    /**
     * Used to avoid race conditions when changing the order of participants.
     */
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
    
    
    
    /**
     * This modifier should be used for any function that modifies the ordering of participants,
     * unless the function returns a value. If the function returns a value, the logic in this
     * modifier should be reproduced within the function itself.
     */
    modifier useOrderingLock() {
        require(!isOrderingLocked);
        isOrderingLocked = true;
        _;
        isOrderingLocked = false;
    }
    
    
    
    /**
     * @param participant
     */
    function addParticipant(address participant) public ownerOnly useOrderingLock {
        require(state == State.REGISTRATION);
        
        uint newLength = participants.push(participant);
        participantMap[participant] = newLength; // this is already index + 1
    }
    
    
    
    /**
     * @param participant
     */
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
    
    
    
    /**
     * @returns
     *    The number of participants stored in `participants`.
     */
    function getNumberOfParticipants() public constant returns (uint) {
        return participants.length;
    }
    
    
    
    /**
     * Allows the owner to close registration. In ERC 721 mode, this is where the tokens are
     * created. State will transition to `MINTING_TOKENS` for this. After this step, or in
     * non ERC 721 mode, state will transition to `PAYMENT_SUBMISSION`.
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
    
    
    
    /**
     * If a fixed payment amount was set, then each user will end up getting one token.
     * Otherwise, we will mint 100 tokens here and give each user a number of them based
     * on their percentage stake in the pool.
     */
    function __mintTokens() private {
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
    
    

    /**
     * Allows a participant to make a payment during `PAYMENT_SUBMISSION`.
     *
     * If in fixed payment mode, the participant may only make payments that are
     * exactly the fixed payment amount.
     *
     * In non fixed payment mode, the participant may make any payment amount they
     * want. Subsequent calls will simply add to whatever amount has already been
     * paid.
     *
     * Once the last payment is collected, state will transition to `DISTRIBUTION`.
     */
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
    
    
    
    /**
     * Keeps track of how many participants have paid so that we can tell
     * when the last payment is being made.
     */
    function __setPaymentsMadeState() private {
        if (paymentsMade[msg.sender] == 0) {
            numParticipantsPaid += 1;
        }
    }
    
    
    
    /* DISTRIBUTION state functions */
    
    
    
    /**
     * Calculates the number of ERC 721 tokens each participant should receive
     * based on how much they paid in.
     */
    function __calcWithdrawalTokens() private {
        uint participantPayment;
        uint percentage;
        
        for (uint i = 0; i < participants.length; i++) {
            participantPayment = paymentsMade[participants[i]];
            percentage = (participantPayment * 100) / totalWei;
            pending721Withdrawals[participants[i]] = percentage;
        }
    }
    
    
    
    /**
     * The participant calls this function to withdraw the ERC 721 tokens they
     * received.
     */
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