import { Injectable } from "@angular/core";
import { Web3Service } from "services/web3.service";
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import { InitEventStreamService } from "./initEventStream.service";
import { initializeContract } from "../util/contractInitializer";

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
      return initializeContract(this.__web3Service, this.ContractDirectory, config)

        .mergeMap((contractClass: any) => {
          this.ContractDirectory = contractClass;

          if (config.contractDirectory) {
            return Observable.from(this.ContractDirectory.at(config.contractDirectory));
          } else {
            return Observable.from(this.ContractDirectory.new());
          }
        })

        .mergeMap((instance: any) => {
          this.__contractDirectory = instance;
          console.log(`Contract directory is at: ${instance.address}`);
          return Observable.of(true);
        })

        .catch((error: any, caught: Observable<any>): any => {
          console.error(error);
        });
    }



    getAddressFor(contractName: string): Observable<string> {
      // It's important that we don't use the init event stream here. This is required as part
      // of the initialization phase for other services. Since this service is the first to be
      // loaded, it's safe to not use init event stream here.
      return Observable.from(this.__contractDirectory.contractName2Address(contractName));
    }



    updateContract(name: string, addr: string) {
      // Same thing here in regard to init event stream
      return Observable.from(this.__contractDirectory.updateContract(name, addr));
    }

}