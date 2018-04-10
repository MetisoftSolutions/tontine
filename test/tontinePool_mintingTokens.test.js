const TontinePool = artifacts.require('./tontinePool.sol');
const UniqueToken = artifacts.require('./uniqueToken.sol');

const _ = require('lodash');

const mintingUtil = require('./mintingUtil');



contract('TontinePool', function(accounts) {

  let ownerAccount,
      participantAccounts,
      pool;



  before(function() {
    ownerAccount = accounts[0];
    participantAccounts = accounts.slice(1);
  });



  beforeEach(function(done) {
    TontinePool.new('test', false, 0, true, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[1]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[2]);
      })

      .then(function() {
        return pool.closeRegistration();
      })

      .then(function() {
        console.log("registration closed");
        done();
      });
  });

  

  function testMintingCycle(uniqueToken, expectedNumTokens) {
    return Promise.resolve({})

      .then(function() {
        return uniqueToken.totalSupply.call();
      })

      .then(function(numTokens) {
        assert.equal(numTokens.toNumber(), expectedNumTokens);

        expectedNumTokens += 10;
        return pool.mintSubsetOfTokens();
      })

      .then(function(result) {
        let allTokensMinted = false,
            mintingStatusEvent = mintingUtil.getMintingStatusEventFromLogs(result.logs);

        if (mintingStatusEvent && mintingStatusEvent.args && mintingStatusEvent.args.isComplete) {
          allTokensMinted = true;
        }

        if (!allTokensMinted) {
          return testMintingCycle(uniqueToken, expectedNumTokens);
        } else {
          return true;
        }
      });
  }



  function mintAllTokens() {
    return Promise.resolve({})

      .then(function() {
        return pool.mintSubsetOfTokens();
      })

      .then(function(result) {
        let allTokensMinted = false,
            mintingStatusEvent = mintingUtil.getMintingStatusEventFromLogs(result.logs);

        if (mintingStatusEvent && mintingStatusEvent.args && mintingStatusEvent.args.isComplete) {
          allTokensMinted = true;
        }

        if (!allTokensMinted) {
          return mintAllTokens();
        }
      });
  }



  it("should mint all tokens properly", function(done) {
    let erc721Address,
        uniqueToken,
        expectedNumTokens = 0;

    Promise.resolve({})

      .then(function() {
        return pool.erc721Master.call();
      })

      .then(function(address) {
        assert.notEqual(address, '', "address shouldn't be blank");
        erc721Address = address;
        uniqueToken = UniqueToken.at(erc721Address);
      })

      .then(function() {
        return testMintingCycle(uniqueToken, expectedNumTokens);
      })

      .then(function() {
        return uniqueToken.totalSupply();
      })

      .then(function(numTokens) {
        assert.equal(numTokens.toNumber(), 100, "there should be 100 tokens");
        done();
      });
  });


  
  it("should transition to payment submission", function(done) {
    Promise.resolve({})

      .then(function() {
        return mintAllTokens();
      })

      .then(function() {
        return pool.transitionToPaymentSubmission();
      })

      .then(function() {
        return pool.state.call();
      })

      .then(function(status) {
        const PAYMENT_SUBMISSION = 2;
        assert.equal(status, PAYMENT_SUBMISSION, "status should be PAYMENT_SUBMISSION");
        done();
      });
  });

});