const mintingUtil = require('./mintingUtil');
const UniqueToken = artifacts.require('./uniqueToken.sol');



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



function advanceNewPoolToPaymentSubmissionState(pool, ownerAccount, participants) {
  return Promise.resolve({})

    .then(function() {
      return addParticipants(pool, participants);
    })

    .then(function() {
      return pool.closeRegistration();
    })

    .then(function() {
      return mintingUtil.mintAllTokens(pool, ownerAccount);
    })

    .then(function() {
      return pool.transitionToPaymentSubmission();
    });
}



/**
 * 
 * @param {TontinePool} pool 
 * @param {Address[]} participants 
 * 
 * @param {PaymentDetail[]} paymentDetails 
 *    It is assumed that this detail set contains all participants and the
 *    appropriate amount of payments to transition the pool to the DISTRIBUTION
 *    state.
 */
function advanceNewPoolToDistributionState(pool, ownerAccount, participants, paymentDetails) {
  return advanceNewPoolToPaymentSubmissionState(pool, ownerAccount, participants)

    .then(function() {
      return makePayments(pool, paymentDetails);
    });
}



function genFixedPaymentDetails(participants, fixedAmountWei) {
  return _.map(participants, function(participant) {
    return {
      account: participant,
      amountWei: fixedAmountWei
    };
  });
}



function getTokenInstance(pool) {
  return Promise.resolve({})

    .then(function() {
      return pool.erc721Master.call();
    })

    .then(function(address) {
      return UniqueToken.at(address);
    });
}



exports = module.exports = {
  advanceNewPoolToPaymentSubmissionState: advanceNewPoolToPaymentSubmissionState,
  advanceNewPoolToDistributionState: advanceNewPoolToDistributionState,
  makePayments: makePayments,
  genFixedPaymentDetails: genFixedPaymentDetails,
  getTokenInstance: getTokenInstance
};