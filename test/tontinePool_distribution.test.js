const TontinePool = artifacts.require('./tontinePool.sol');
const UniqueToken = artifacts.require('./uniqueToken.sol');

const _ = require('lodash');

const mintingUtil = require('./mintingUtil');
const poolUtil = require('./poolUtil');



const GWEI = 1000000000;



contract('TontinePool', function(accounts) {

  let ownerAccount,
      participantAccounts,
      pool;

  

  before(function() {
    ownerAccount = accounts[0];
    participantAccounts = accounts.slice(1);
  });



  function verifyFixedParticipantTokens(token, participants) {
    let participant = participants[0],
        remainingParticipants = participants.slice(1);

    return Promise.resolve({})

      .then(function() {
        return token.balanceOf(participant);
      })

      .then(function(numTokens) {
        assert.equal(numTokens.toNumber(), 1, "numTokens should be 1 for fixed payments");

        if (remainingParticipants.length > 0) {
          return verifyFixedParticipantTokens(token, remainingParticipants);
        }
      });
  }



  it("should distribute tokens appropriately for fixed payments", function(done) {
    let pool,
        paymentDetails = poolUtil.genFixedPaymentDetails(participantAccounts, 1 * GWEI),
        uniqueToken;

    TontinePool.new(false, 1 * GWEI, true, false)

      .then(function(instance) {
        pool = instance;
        console.log(`Pool address: ${pool.address}`);
        return poolUtil.advanceNewPoolToDistributionState(pool, ownerAccount, participantAccounts, paymentDetails);
      })

      .then(function() {
        return pool.distributeTokens();
      })

      .then(function() {
        return poolUtil.getTokenInstance(pool);
      })

      .then(function(tokenInstance) {
        uniqueToken = tokenInstance;
        return verifyFixedParticipantTokens(uniqueToken, participantAccounts);
      })

      .then(function() {
        done();
      });
  });

});