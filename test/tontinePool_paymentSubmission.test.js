const TontinePool = artifacts.require('./tontinePool.sol');
const _ = require('lodash');
const mintingUtil = require('./mintingUtil');



const GWEI = 1000000000;



contract('TontinePool', function(accounts) {

  let ownerAccount,
      participantAccounts,
      pool;



  before(function() {
    ownerAccount = accounts[0];
    participantAccounts = accounts.slice(1);
  });



  function addParticipants(pool, participants) {
    let participant = participants[0],
        remainingParticipants = participants.slice(1);
    
    return Promise.resolve({})

      .then(function() {
        return pool.addParticipant(participant);
      })

      .then(function() {
        if (remainingParticipants.length > 0) {
          return addParticipants(pool, remainingParticipants);
        }
      });
  }



  function advanceNewPoolToPaymentSubmissionState(pool, participants) {
    return Promise.resolve({})

      .then(function() {
        return addParticipants(pool, participantAccounts);
      })

      .then(function() {
        return pool.closeRegistration();
      })

      .then(function() {
        return mintingUtil.mintAllTokens(pool);
      })

      .then(function() {
        return pool.transitionToPaymentSubmission();
      });
  }



  /**
   * @typedef PaymentDetail
   * @type Object
   * 
   * @property {string} account
   * @property {number|string} amountWei
   */

  /**
   * Makes the payments specified in `paymentDetails`. Payments are made in
   * the order given. Multiple payment events per account is allowed.
   * 
   * @param {TontinePool} pool
   * @param {PaymentDetail[]} paymentDetails 
   * @returns {Promise<undefined>}
   */
  function makePayments(pool, paymentDetails) {
    let paymentDetail = paymentDetails[0],
        remainingPayments = paymentDetails.slice(1);

    return Promise.resolve({})

      .then(function() {
        return makePayment(pool, paymentDetail);
      })

      .then(function() {
        if (remainingPayments.length > 0) {
          return makePayments(pool, remainingPayments);
        }
      });
  }



  /**
   * @param {TontinePool} pool
   * @param {PaymentDetail} paymentDetail 
   * @returns {Promise<undefined>}
   */
  function makePayment(pool, paymentDetail) {
    return pool.makePayment({
      from: paymentDetail.account,
      value: paymentDetail.amountWei
    });
  }



  it("should make all fixed payments properly", function(done) {
    let pool,
        fixedAmountWei = 1 * GWEI,
        paymentDetails;

    paymentDetails = _.map(participantAccounts, function(participant) {
      return {
        account: participant,
        amountWei: fixedAmountWei
      };
    });

    TontinePool.new(false, 1 * GWEI, true, false)

      .then(function(instance) {
        pool = instance;
        return advanceNewPoolToPaymentSubmissionState(pool);
      })

      .then(function() {
        return makePayments(pool, paymentDetails);
      })

      .then(function() {
        return Promise.all(
          _.map(participantAccounts, function(participant) {
            return pool.paymentsMade(participant);
          })
        );
      })

      .then(function(paymentsMade) {
        _.forEach(paymentsMade, function(paymentMade, index) {
          let paymentDetail = paymentDetails[index];

          assert.equal(paymentMade, paymentDetail.amountWei, "payment made should be the same");
          assert.equal(participantAccounts[index], paymentDetail.account, "account should be the same");
        });

        return pool.state.call();
      })

      .then(function(state) {
        const DISTRIBUTION = 3;
        assert.equal(state, DISTRIBUTION, "state should be DISTRIBUTION");
        done();
      });
  });

});