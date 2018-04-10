import { Injectable } from "@angular/core";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";

const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');
const config = require('../../config/rinkeby.config.js');


@Injectable()
export class ContractDirectoryService {

    private ContractDirectory = contract(contractDirectory);
    private __contractDirectory: any;
    private __initEventStream: BehaviorSubject<string>;

    constructor(
      private __web3Service: Web3Service
    ) {

    }



    init(initEventStream: BehaviorSubject<string>): Observable<any> {
      this.__initEventStream = initEventStream;
      
      return this.__web3Service.getPrimaryAccount()

        .flatMap((account: string) => {
          this.ContractDirectory.setProvider(this.__web3Service.web3.currentProvider);
          this.ContractDirectory.defaults({from: account});

          this.__contractDirectory = this.ContractDirectory.at(config.contractDirectory);

          return Observable.of(true);
        });
    }



    getAddressFor(contractName: string) {
      return this.__contractDirectory.contractName2Address(contractName);
    }

}