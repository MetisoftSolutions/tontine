import { Injectable } from "@angular/core";
import { ContractDirectoryService } from "services/contractDirectory.service";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";

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



    init(initEventStream: BehaviorSubject<string>): Observable<any> {
      this.__initEventStream = initEventStream;
      
      return this.__web3Service.getPrimaryAccount()

        .flatMap((account: string) => {
          this.PoolDirectory.setProvider(this.__web3Service.web3.currentProvider);
          this.PoolDirectory.defaults({from: account});
          
          return Observable.from(this.__contractDirectory.getAddressFor('TontinePoolDirectory'));
        })

        .flatMap((address: string) => {
          console.log(`Pool directory at: ${address}`);
          this.__poolDirectory = this.PoolDirectory.at(address);

          return Observable.of(true);
        });
    }



    getPoolsForUser(userAddress: string): Observable<any> {
      return null;
      /*
      return Observable.create((observer: Observer<any>) => {
        if (!this.__initialized) {
          this.__poolRequests.push(observer);
        }
      });
      */
    }
}