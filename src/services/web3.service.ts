import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs/Rx';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { environment } from '../environments/environment';

const Web3 = require('web3');

const networks = {
      '1': 'mainnet',
      '3': 'ropsten',
      '4': 'rinkeby'
    };

declare var window: any;

@Injectable()
export class Web3Service {

  web3: any;
  primaryAccountIndex: number = 0;
  accountSwitchEventStream: Subject<string> = new Subject<string>();

  private __initialized = false;

  constructor() {
    this.checkAndInstantiateWeb3();
  }


  
  checkAndInstantiateWeb3 = () => {
    if (this.__initialized) { return; }
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        `No web3 detected. Falling back to ${environment.HttpProvider}. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask`
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider(environment.HttpProvider)
      );
    }
    this.__initialized = true;
  };



  getNetworkName(): Observable<any> {
    return Observable.create((observer) => {
      this.web3.version.getNetwork((err, networkId) => {
        if (networks.hasOwnProperty(networkId)) {
          observer.next(networks[networkId]);
        } else {
          observer.next('local');
        }

        observer.complete();
      });
    });
  }



  getAccounts(): Observable<any> {
    return Observable.create(observer => {
      this.web3.eth.getAccounts((err, accounts) => {
        if (err != null) {
          observer.error(err);
        }

        if (accounts && accounts.length === 0) {
          observer.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        }

        observer.next(accounts);
        observer.complete();
      });
    });
  }



  getPrimaryAccount(): Observable<any> {    
    return this.getAccounts()

      .mergeMap((accounts): Observable<any> => {
        return Observable.of(accounts[this.primaryAccountIndex]);
      });
  }



  setPrimaryAccount(account: string, index: number) {
    this.primaryAccountIndex = index;
    this.accountSwitchEventStream.next(account);
  }

}
