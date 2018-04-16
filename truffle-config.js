// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      gas: '6000000',
      network_id: '*' // Match any network id
    },
    rinkeby: {
      network_id: 4,
      host: '127.0.0.1',
      port: 8545,
      gas: 4000000,
      from: '0x4c144E2AB96882408Cdf9aBA485Dc68116DDC666'
    }
  }
}
