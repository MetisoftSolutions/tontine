var TontinePool = artifacts.require('./tontinePool.sol');
var UniqueToken = artifacts.require('./uniqueToken.sol');
const _ = require('lodash');



contract('TontinePool', function(accounts) {

  let ownerAccount,
      participantAccounts,
      pool;



  before(function() {
    ownerAccount = accounts[0];
    participantAccounts = accounts.slice(1);
  });



  beforeEach(function(done) {
    TontinePool.new(false, 0, true, false)

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



  it("should mint all tokens properly", function(done) {
    let erc721Address,
        uniqueToken,
        expectedNumTokens = 0;

    function testMintingCycle() {
      return Promise.resolve({})

        .then(function() {
          return uniqueToken.totalSupply();
        })

        .then(function(numTokens) {
          assert.equal(numTokens.toNumber(), expectedNumTokens);

          expectedNumTokens += 10;
          return pool.mintSubsetOfTokens();
        })

        .then(function(result) {
          let allTokensMinted = false;

          _.forEach(result.logs, function(log) {
            if (allTokensMinted) return;
            allTokensMinted = (log.event === 'MintingStatus' && log.args.b === true);
          });

          if (!allTokensMinted) {
            return testMintingCycle();
          } else {
            return true;
          }
        });
    }

    Promise.resolve({})

      .then(function() {
        return pool.erc721Master();
      })

      .then(function(address) {
        assert.notEqual(address, '', "address shouldn't be blank");
        erc721Address = address;
        uniqueToken = UniqueToken.at(erc721Address);
      })

      .then(function() {
        return testMintingCycle();
      })

      .then(function() {
        return uniqueToken.totalSupply();
      })

      .then(function(numTokens) {
        assert.equal(numTokens.toNumber(), 100, "there should be 100 tokens");
        done();
      });
  });

});