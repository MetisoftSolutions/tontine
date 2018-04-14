import { Injectable } from "@angular/core";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import { InitEventStreamService } from "./initEventStream.service";

const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');
const config = require('../../config/rinkeby.config.js');


@Injectable()
export class ContractDirectoryService {

    private ContractDirectory = contract(contractDirectory);
    private __contractDirectory: any;

    constructor(
      private __web3Service: Web3Service,
      private __initEventStreamService: InitEventStreamService
    ) {

    }



    init(config: any): Observable<any> {
      return this.__web3Service.getPrimaryAccount()

        .flatMap((account: string) => {
          let gas = config.gas,
              defaults: any = {
                from: account
              };

          if (gas) {
            defaults.gas = gas;
          }

          this.ContractDirectory.setProvider(this.__web3Service.web3.currentProvider);
          this.ContractDirectory.defaults(defaults);

          if (config.contractDirectory) {
            return Observable.from(this.ContractDirectory.at(config.contractDirectory));
          } else {
            return Observable.from(this.ContractDirectory.new());
          }
        })

        .flatMap((instance: any) => {
          this.__contractDirectory = instance;
          console.log(`Contract directory is at: ${instance.address}`);
          return Observable.of(true);
        })

        .catch((error: any, caught: Observable<any>): any => {
          console.error(error);
        });
    }



    getAddressFor(contractName: string): Observable<string> {
      return Observable.from(this.__contractDirectory.contractName2Address(contractName));
    }



    updateContract(name: string, addr: string) {
      return this.__initEventStreamService.stream
        .mergeMap(() => {
          return Observable.from(this.__contractDirectory.updateContract(name, addr));
        });
    }

}