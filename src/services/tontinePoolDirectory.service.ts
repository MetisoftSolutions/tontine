import { Injectable } from "@angular/core";
import { ContractDirectoryService } from "services/contractDirectory.service";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import * as _ from 'lodash';
import { InitEventStreamService } from "./initEventStream.service";
import { initializeContract } from "../util/contractInitializer";

const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');
const poolDirectory = require('../../build/contracts/TontinePoolDirectory.json');



@Injectable()
export class TontinePoolDirectoryService {

    private PoolDirectory = contract(poolDirectory);
    private __poolDirectory: any;

    private __poolRequests: Observer<any>[] = [];

    constructor(
      private __web3Service: Web3Service,
      private __contractDirectory: ContractDirectoryService,
      private __initEventStreamService: InitEventStreamService
    ) {
      
    }



    init(config: any): Observable<any> {
      return initializeContract(this.__web3Service, this.PoolDirectory, config)

        .mergeMap((contractClass): Observable<string> => {
          this.PoolDirectory = contractClass;

          if (config.contractDirectory) {
            return this.__contractDirectory.getAddressFor('TontinePoolDirectory');
          } else {
            return this.__createPoolDirectory();
          }
        })

        .mergeMap((address: string) => {
          console.log(`Pool directory at: ${address}`);
          return Observable.from(this.PoolDirectory.at(address));
        })

        .mergeMap((instance: any) => {
          this.__poolDirectory = instance;
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
          return Observable.from(this.__contractDirectory.updateContract('TontinePoolDirectory', instance.address));
        })

        .mergeMap(() => {
          return Observable.of(this.__poolDirectory.address);
        })

        .catch((err: any) => {
          console.error(err);
          return Observable.of(null);
        });
    }



    setAccount(account: string) {
      this.PoolDirectory.defaults({from: account});
    }



    addPoolForOwner(poolAddress: string, userAddress: string) {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return Observable.from(this.__poolDirectory.addPoolForOwner(poolAddress));
        });
    }



    addPoolForParticipant(poolAddress: string, userAddress: string) {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return Observable.from(this.__poolDirectory.addPoolForParticipant(poolAddress, userAddress));
        })

        .mergeMap(() => {
          return Observable.from(this.__poolDirectory.participant2PoolsMap(poolAddress, userAddress));
        })

        .mergeMap((index: any) => {
          console.log(index.toNumber());
          return Observable.of(null);
        });
    }



    removePoolForParticipant(poolAddress: string, userAddress: string) {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return Observable.from(this.__poolDirectory.removePoolForParticipant(poolAddress, userAddress));
        });
    }



    getPoolsForOwner(userAddress: string): Observable<any> {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return this.__getPools(userAddress, this.__poolDirectory.getNumOwnedPools.bind(this.__poolDirectory), this.__poolDirectory.user2OwnedPools.bind(this.__poolDirectory));
        });
    }



    getPoolsForParticipant(userAddress: string): Observable<any> {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return this.__getPools(userAddress, this.__poolDirectory.getNumParticipantPools.bind(this.__poolDirectory), this.__poolDirectory.participant2Pools.bind(this.__poolDirectory));
        });
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