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
    if (!participants) {
      participants = participantAccounts;
    }

    return Promise.resolve({})

      .then(function() {
        return addParticipants(pool, participants);
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



  /**
   * Executes multiple calls to the smart contract to ensure that the actual
   * payments made is equal to what is given in `paymentDetails`.
   * 
   * @param {TontinePool} pool 
   * @param {PaymentDetail[]} paymentDetails
   */
  function verifyPaymentsMade(pool, paymentDetails) {
    let currentPaymentDetail = paymentDetails[0],
        remainingPaymentDetails = paymentDetails.slice(1);

    return Promise.resolve({})

      .then(function() {
        return pool.paymentsMade.call(currentPaymentDetail.account);
      })

      .then(function(actualPaymentMade) {
        assert.equal(actualPaymentMade.toNumber(), currentPaymentDetail.amountWei, "amount should be the same");

        if (remainingPaymentDetails.length > 0) {
          return verifyPaymentsMade(pool, remainingPaymentDetails);
        }
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



  it("should make all non-fixed payments properly", function(done) {
    let pool,
        participants = [
          participantAccounts[0],
          participantAccounts[5],
          participantAccounts[3],
          participantAccounts[6],
          participantAccounts[8]
        ],
        paymentDetails = [
          {
            account: participantAccounts[0],
            amountWei: 1 * GWEI
          },
          {
            account: participantAccounts[5],
            amountWei: 2 * GWEI
          },
          {
            account: participantAccounts[3],
            amountWei: 1 * GWEI
          },
          {
            account: participantAccounts[6],
            amountWei: 2.5 * GWEI
          },
          {
            account: participantAccounts[3],  // repeat participant
            amountWei: 1 * GWEI
          },
          {
            account: participantAccounts[8],
            amountWei: 3.5 * GWEI
          }
        ];

    TontinePool.new(false, 0, true, false)

        .then(function(instance) {
          pool = instance;
          return advanceNewPoolToPaymentSubmissionState(pool, participants);
        })

        .then(function() {
          return makePayments(pool, paymentDetails);
        })

        .then(function() {
          return pool.getNumberOfParticipants();
        })

        .then(function(numParticipants) {
          let collapsedDetails = _.cloneDeep(paymentDetails);

          collapsedDetails[2].amountWei += collapsedDetails[4].amountWei;
          collapsedDetails.splice(4, 1);

          assert.equal(numParticipants.toNumber(), participants.length);
          
          return verifyPaymentsMade(pool, collapsedDetails);
        })

        .then(function() {
          done();
        });
  });

});