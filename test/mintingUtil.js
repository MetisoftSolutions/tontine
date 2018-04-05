function getMintingStatusEventFromLogs(logs) {
  let event = null;

  _.forEach(logs, function(log) {
    if (log.event === 'MintingStatus') {
      event = log;
    }
  });

  return event;
}
  
  
  
function mintAllTokens(pool) {
  return Promise.resolve({})

    .then(function() {
      return pool.mintSubsetOfTokens();
    })

    .then(function(result) {
      let allTokensMinted = false,
          mintingStatusEvent = getMintingStatusEventFromLogs(result.logs);

      if (mintingStatusEvent && mintingStatusEvent.args && mintingStatusEvent.args.isComplete) {
        allTokensMinted = true;
      }

      if (!allTokensMinted) {
        return mintAllTokens();
      }
    });
}



exports = module.exports = {
  getMintingStatusEventFromLogs: getMintingStatusEventFromLogs,
  mintAllTokens: mintAllTokens
};