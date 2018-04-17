# TontineBlock
 	
 ------------------------

## Installation
1. Grab [angular-cli](https://github.com/angular/angular-cli) (aka. `ng`) by running `npm install -g @angular/cli`.
2. Grab [ganache-cli](https://github.com/trufflesuite/ganache-cli) to run a local blockchain RPC server (`npm install -g ganache-cli`). After that, simply run `ganache-cli` in a new tab. (Running the UI version of Ganache will also work.)
3. Ganache should be running at `http://127.0.0.1:7545` or `http://localhost:7545`. If it's not, this can be changed in the Ganache settings.

If you have MetaMask ([MetaMask.io](https://metamask.io)) running as an extension in your browser, disable it if you wish to use the local blockchain provided by Ganache (recommended for testing, as it executes way faster than testnets). If you want to use a testnet, MetaMask will work fine.

4. Use `truffle compile` to compile your contracts.
5. Run `ng serve`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

You can also run `npm run compile-start` to automatically run all 3 steps.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `truffle test` to run tests associated with the Solidity smart contracts. The test folder for this can be found in the `test` directory at the root level of this project. Note that this requires Ganache to be running.

## Technologies & Languages Used
1. Angular4 (Typescript/Javascript)
2. Truffle (Solidity)
