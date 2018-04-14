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
    string public name;
    
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
        CALC_WITHDRAWAL_TOKENS,
        DISTRIBUTION
    }
    State public state = State.REGISTRATION;
    event StateChange(State newState);


    uint maxNum721Tokens;
    

    mapping(address => uint) public paymentsMade;
    uint public totalWei;
    uint public numParticipantsPaid;
    mapping(address => uint) public pending721Withdrawals;
    
    
    
    function TontinePool(string _name, bool _useRandomOrdering, uint _fixedPaymentAmountWei, bool _useErc721, bool _useSinglePayment) public {
        owner = msg.sender;

        name = _name;
        useRandomOrdering = _useRandomOrdering;
        fixedPaymentAmountWei = _fixedPaymentAmountWei;
        useErc721 = _useErc721;
        useSinglePayment = _useSinglePayment;
    }
    
    
    
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }



    function __changeState(State newState) private {
        state = newState;
        emit StateChange(newState);
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
    
    
    
    function addParticipant(address participant) public ownerOnly useOrderingLock {
        require(state == State.REGISTRATION);
        require(participantMap[participant] == 0);
        
        uint newLength = participants.push(participant);
        participantMap[participant] = newLength; // this is already index + 1
    }
    
    
    
    function removeParticipant(address participant) public ownerOnly useOrderingLock {
        require(state == State.REGISTRATION);
        require(participants.length > 0);
        
        uint indexToRemove = participantMap[participant];
        require(indexToRemove > 0);
        indexToRemove -= 1;
        
        if (participants.length > 1) {
          address lastParticipant = participants[participants.length - 1];
          participants[indexToRemove] = lastParticipant;
        }
        participants.length -= 1;
        
        // update the map for both participants
        participantMap[lastParticipant] = indexToRemove + 1;
        participantMap[participant] = 0;
    }
    
    
    
    /**
     * @return The number of participants stored in `participants`.
     */
    function getNumberOfParticipants() public constant returns (uint) {
        return participants.length;
    }
    
    
    
    /**
     * Allows the owner to close registration. In ERC 721 mode, this is where the tokens are
     * created. State will transition to `MINTING_TOKENS` for this. After this step, the caller
     * must call `mintSubsetOfTokens()` until it returns `1`, and then manually call `transitionToPaymentSubmission()`.
     * The multiple calls are necessary as minting all tokens at once will likely overrun network
     * per-transaction gas limits.
     *
     * If in non ERC 721 mode, state will transition to `PAYMENT_SUBMISSION` automatically.
     */
    function closeRegistration() public ownerOnly useOrderingLock {
        require(participants.length > 1);

        if (useErc721) {
            __changeState(State.MINTING_TOKENS);
            __createErc721Token();
            maxNum721Tokens = __determineMaxNum721Tokens();
        
        } else {
            __changeState(State.PAYMENT_SUBMISSION);
        }
    }
    
    
    
    function __createErc721Token() private {
        erc721Master = new UniqueToken("test", "TEST");
    }



    /**
     * Emits `MintingStatus` of `false` if all tokens are still not minted and
     * another call must be made. `true` if all tokens are now minted.
     */
    function mintSubsetOfTokens() public ownerOnly {
        require(state == State.MINTING_TOKENS);
        __mintSubsetOfTokens(maxNum721Tokens);
    }



    event MintingStatus(bool isComplete, uint256[10] tokenIdsMinted);
    /**
     * Emits `MintingStatus` of `false` if all tokens are still not minted and
     * another call must be made. `true` if all tokens are now minted.
     */
    function __mintSubsetOfTokens(uint totalNumTokens) private {
        UniqueToken uniqueToken = UniqueToken(erc721Master);
        uint numExistingTokens = uniqueToken.totalSupply();
        uint maxBatchSize = 10;
        uint batchSize;
        uint256[10] memory tokenIds;

        if (numExistingTokens >= totalNumTokens) {
            emit MintingStatus(true, tokenIds);
        }

        batchSize = totalNumTokens - numExistingTokens;
        if (batchSize > maxBatchSize) {
            batchSize = maxBatchSize;
        } else if (batchSize < 0) {
            batchSize = 0;
        }
        
        tokenIds = uniqueToken.mint(address(this), batchSize);

        if (batchSize + numExistingTokens >= totalNumTokens) {
            emit MintingStatus(true, tokenIds);
        } else {
            emit MintingStatus(false, tokenIds);
        }
    }



    function transitionToPaymentSubmission() public ownerOnly {
        require(state == State.MINTING_TOKENS);

        UniqueToken uniqueToken = UniqueToken(erc721Master);
        uint numExistingTokens = uniqueToken.totalSupply();
        require (numExistingTokens >= maxNum721Tokens);

        __changeState(State.PAYMENT_SUBMISSION);
    }
    
    
    
    /**
     * Determines the number of unique tokens to mint. If a fixed payment was set, then
     * each user will end up getting one token. For single payment contracts, only one
     * token is ever minted. Otherwise, we will want to mint 100 tokens.
     */
    function __determineMaxNum721Tokens() private returns (uint) {
        uint numTokens = 100;
        
        if (fixedPaymentAmountWei > 0) {
            numTokens = participants.length;
        } else if (useSinglePayment) {
            numTokens = 1;
        }

        return numTokens;
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
     * Once the last payment is collected, state will transition to `CALC_WITHDRAWAL_TOKENS`.
     */
    function makePayment() public payable participantOnly {
        require(state == State.PAYMENT_SUBMISSION);
        
        __setPaymentsMadeState();
        if (numParticipantsPaid == participants.length) {
            __changeState(State.CALC_WITHDRAWAL_TOKENS);
        }
        
        if (fixedPaymentAmountWei > 0) {
            require(msg.value == fixedPaymentAmountWei);
            require(paymentsMade[msg.sender] == 0); // don't double pay for fixed amounts
        }
        
        paymentsMade[msg.sender] += msg.value;
        totalWei += msg.value;
        
        if (state == State.CALC_WITHDRAWAL_TOKENS) {
            if (!useSinglePayment) {
                __calcWithdrawalTokens();
                __changeState(State.DISTRIBUTION);
            } else {
                __changeState(State.DISTRIBUTION);
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
    
    
    
    /* CALC_WITHDRAWAL_TOKENS state functions */
    
    
    
    /**
     * Calculates the number of ERC 721 tokens each participant should receive
     * based on how much they paid in.
     */
    function __calcWithdrawalTokens() private {
        require(state == State.CALC_WITHDRAWAL_TOKENS);

        uint participantPayment;
        uint percentage;
        
        for (uint i = 0; i < participants.length; i++) {
            participantPayment = paymentsMade[participants[i]];

            if (fixedPaymentAmountWei > 0) {
                pending721Withdrawals[participants[i]] = 1;
            } else {
                percentage = (participantPayment * 100) / totalWei;
                pending721Withdrawals[participants[i]] = percentage;
            }
        }
    }
    
    
    
    /* DISTRIBUTION state functions */



    /**
     * Distributes all pending 721 tokens to the appropriate participants.
     */
    function distributeTokens() public ownerOnly {
        require(state == State.DISTRIBUTION);

        uint256 tokenId = 1;
        uint256 numTokensForParticipant;
        address participant;
        UniqueToken uniqueToken = UniqueToken(erc721Master);

        for (uint i = 0; i < participants.length; i++) {
            participant = participants[i];
            numTokensForParticipant = uint256(pending721Withdrawals[participant]);
            pending721Withdrawals[participant] = 0;

            for (uint j = 0; j < numTokensForParticipant; j++) {
                uniqueToken.transfer(participant, tokenId);
                tokenId += 1;
            }
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