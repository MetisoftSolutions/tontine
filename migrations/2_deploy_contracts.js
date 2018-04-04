var TontineContractDirectory = artifacts.require('./tontineContractDirectory.sol');
var TontinePoolDirectory = artifacts.require('./tontinePoolDirectory.sol');
var TontinePool = artifacts.require('./tontinePool.sol');

module.exports = function(deployer) {
  let contractDirectory,
      poolDirectory;
/*
  deployer

    .then(() => {
      return Promise.all([
        TontineContractDirectory.new(),
        TontinePoolDirectory.new()
      ]);
    })

    .then((instances) => {
      [contractDirectory, poolDirectory] = instances;

      console.log(`Contract directory at: ${contractDirectory.address}`);

      return contractDirectory.updateContract("tontinePoolDirectory", poolDirectory.address);
    });*/
  
};
