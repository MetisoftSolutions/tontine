var TontineContractDirectory = artifacts.require('./tontineContractDirectory.sol');
var TontinePoolDirectory = artifacts.require('./tontinePoolDirectory.sol');
var TontinePool = artifacts.require('./tontinePool.sol');



contract('TontinePool', function(accounts) {

  let contractDirectory,
      poolDirectory;

  let ownerAccount,
      participantAccounts;



  before(function(done) {
    ownerAccount = accounts[0];
    participantAccounts = accounts.slice(1);

    Promise.resolve({})

      .then(function() {
        return Promise.all([
          TontineContractDirectory.new(),
          TontinePoolDirectory.new()
        ]);
      })

      .then(function(instances) {
        [contractDirectory, poolDirectory] = instances;
        return contractDirectory.updateContract("tontinePoolDirectory", poolDirectory.address);
      })

      .then(function() {
        done();
      });
  });



  it("should add a participant", function(done) {
    let pool;
    
    TontinePool.new('test', false, 0, false, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return Promise.all([
          pool.getNumberOfParticipants(),
          pool.participants(0)
        ]);
      })

      .then(function(retVal) {
        let [numParticipants, firstParticipant] = retVal;

        assert.equal(numParticipants, 1, "should have only 1 participant");
        assert.equal(firstParticipant, participantAccounts[0], "participant should be the same");

        done();
      });
  });



  it("should remove a previously added participant", function(done) {
    let pool;

    TontinePool.new('test', false, 0, false, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.getNumberOfParticipants();
      })

      .then(function(numberOfParticipants) {
        assert.equal(numberOfParticipants, 1, "at this point, should have 1 participant");
        return pool.removeParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.getNumberOfParticipants();
      })

      .then(function(numberOfParticipants) {
        assert.equal(numberOfParticipants, 0, "should have no participants");
        done();
      });
  });



  it("should add and remove a bunch of participants", function(done) {
    let pool;

    TontinePool.new('test', false, 0, false, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[2]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[5]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[1]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[4]);
      })

      .then(function() {
        return pool.removeParticipant(participantAccounts[5]);
      })

      .then(function() {
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.removeParticipant(participantAccounts[1]);
      })

      .then(function() {
        return pool.removeParticipant(participantAccounts[4]);
      })

      .then(function() {
        return pool.getNumberOfParticipants();
      })

      .then(function(numberOfParticipants) {
        assert.equal(numberOfParticipants, 2, "should have 2 participants left");
        return Promise.all([
          pool.participants(0),
          pool.participants(1)
        ]);
      })

      .then(function(participants) {
        let expectedParticipants = [
              participantAccounts[2],
              participantAccounts[0]
            ],
            actualParticipants = participants;

        expectedParticipants.sort();
        actualParticipants.sort();

        assert.deepEqual(actualParticipants, expectedParticipants, "participants should match");
        done();
      });
  });



  it("should close registration properly", function(done) {
    let pool;

    TontinePool.new('test', false, 0, false, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.closeRegistration();
      })

      .then(function() {
        return pool.state();
      })

      .then(function(state) {
        const PAYMENT_SUBMISSION = 2;
        assert.equal(state, PAYMENT_SUBMISSION, "should be in PAYMENT_SUBMISSION state");
        done();
      });
  });



  it("should not allow additional participants after registration closes", function(done) {
    let pool;

    TontinePool.new('test', false, 0, false, false)

      .then(function(instance) {
        pool = instance;
        return pool.addParticipant(participantAccounts[0]);
      })

      .then(function() {
        return pool.closeRegistration();
      })

      .then(function() {
        return pool.state();
      })

      .then(function(state) {
        const PAYMENT_SUBMISSION = 2;
        assert.equal(state, PAYMENT_SUBMISSION, "should be in PAYMENT_SUBMISSION state");
        return pool.addParticipant(participantAccounts[1]); // expect failure here
      })

      .catch(function(err) {
        assert.equal(err.name, 'StatusError');
        done();
      });
  });

});