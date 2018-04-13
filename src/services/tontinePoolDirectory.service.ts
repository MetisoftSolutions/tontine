import { Injectable } from "@angular/core";
import { ContractDirectoryService } from "services/contractDirectory.service";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import * as _ from 'lodash';

const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');
const poolDirectory = require('../../build/contracts/TontinePoolDirectory.json');



@Injectable()
export class TontinePoolDirectoryService {

    private PoolDirectory = contract(poolDirectory);
    private __poolDirectory: any;
    private __initEventStream: BehaviorSubject<string>;

    private __poolRequests: Observer<any>[] = [];

    constructor(
      private __web3Service: Web3Service,
      private __contractDirectory: ContractDirectoryService
    ) {
      /*
      this.PoolDirectoryObject.setProvider(this.__web3Service.web3.currentProvider);

      this.__contractDirectory
        .getAddressFor('TontinePoolDirectory')
        .then((result) => {
          this.__poolDirectoryContract = this.PoolDirectoryObject.at(result);
          this.__initialized = true;
          this.__poolRequests.forEach(obs => obs.next(result));
        });
      */
    }



    init(initEventStream: BehaviorSubject<string>, config: any): Observable<any> {
      this.__initEventStream = initEventStream;

      return this.__web3Service.getPrimaryAccount()

        .mergeMap((account: string): Observable<string> => {
          let gas = config.gas,
              defaults: any = {
                from: account
              };

          if (gas) {
            defaults.gas = gas;
          }

          this.PoolDirectory.setProvider(this.__web3Service.web3.currentProvider);
          this.PoolDirectory.defaults(defaults);
          
          if (config.contractDirectory) {
            return Observable.from(this.__contractDirectory.getAddressFor('TontinePoolDirectory'));
          } else {
            return this.__createPoolDirectory();
          }
        })

        .mergeMap((address: string) => {
          console.log(`Pool directory at: ${address}`);
          this.__poolDirectory = this.PoolDirectory.at(address);

          return Observable.of(true);
        })

        .catch((error: any, caught: Observable<any>): any => {
          console.error(error);
        });
    }



    private __createPoolDirectory(): Observable<string> {
      return Observable.from(this.PoolDirectory.new())

        .mergeMap((instance: any) => {
          this.__poolDirectory = instance;
          return this.__contractDirectory.updateContract('TontinePoolDirectory', instance.address);
        })

        .mergeMap(() => {
          return Observable.of(this.__poolDirectory.address);
        });
    }



    addPoolForOwner(poolAddress: string, userAddress: string) {
      return this.__initEventStream
        .mergeMap(() => {
          return Observable.from(this.__poolDirectory.addPoolForOwner(poolAddress, {from: userAddress}));
        });
    }



    getPoolsForOwner(userAddress: string): Observable<any> {
      return this.__initEventStream
        .mergeMap(() => {
          return this.__getPools(userAddress, this.__poolDirectory.getNumOwnedPools.bind(this.__poolDirectory), this.__poolDirectory.user2OwnedPools.bind(this.__poolDirectory));
        });
      /*
      return Observable.from(this.__poolDirectory.getNumOwnedPools(userAddress))

        .mergeMap((numOwnedPools: number) => {
          return Observable.forkJoin(_.map(_.range(numOwnedPools), (index) => {
            return Observable.from(this.__poolDirectory.user2OwnedPools(userAddress, index)).take(1);
          }));
        });*/
    }



    getPoolsForParticipant(userAddress: string): Observable<any> {
      return this.__initEventStream
        .mergeMap(() => {
          return this.__getPools(userAddress, this.__poolDirectory.getNumParticipantPools.bind(this.__poolDirectory), this.__poolDirectory.participant2Pools.bind(this.__poolDirectory));
        });
      /*
      return Observable.from(this.__poolDirectory.getNumParticipantPools(userAddress))

        .mergeMap((numParticipatingPools: number) => {
          return Observable.forkJoin(_.map(_.range(numParticipatingPools), (index) => {
            return Observable.from(this.__poolDirectory.participant2Pools(userAddress, index)).take(1);
          }));
        });*/
    }



    private __getPools(userAddress: string, fnGetNumPools: Function, fnIndex2PoolAddress: Function): Observable<any> {
      return Observable.from(fnGetNumPools(userAddress))

        .mergeMap((numPools: any) => {
          numPools = numPools.toNumber();

          if (numPools > 0) {
            return Observable.combineLatest(_.map(_.range(numPools), (index) => {
              return Observable.from(fnIndex2PoolAddress(userAddress, index));
            }));
          
          } else {
            return Observable.of(['']);
          }
        });
    }
}