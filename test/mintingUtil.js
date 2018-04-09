function getMintingStatusEventFromLogs(logs) {
  let event = null;

  _.forEach(logs, function(log) {
    if (log.event === 'MintingStatus') {
      event = log;
    }
  });

  return event;
}
  
  
  
function mintAllTokens(pool, ownerAccount) {
  return Promise.resolve({})

    .then(function() {
      return pool.mintSubsetOfTokens({from: ownerAccount});
    })

    .then(function(result) {
      let allTokensMinted = false,
          mintingStatusEvent = getMintingStatusEventFromLogs(result.logs);

      if (mintingStatusEvent && mintingStatusEvent.args && mintingStatusEvent.args.isComplete) {
        allTokensMinted = true;
      }

      if (!allTokensMinted) {
        console.log("not all minted yet");
        return mintAllTokens(pool, ownerAccount);
      } else {
        console.log("all minted!");
      }
    });
}



exports = module.exports = {
  getMintingStatusEventFromLogs: getMintingStatusEventFromLogs,
  mintAllTokens: mintAllTokens
};