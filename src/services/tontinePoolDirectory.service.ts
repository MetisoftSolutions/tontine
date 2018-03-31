import { Injectable } from "@angular/core";
import { ContractDirectoryService } from "services/contractDirectory.service";
import { Web3Service } from "services/web3.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";


const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');


@Injectable()
export class TontinePoolDirectoryService {

    private PoolDirectoryObject = contract(contractDirectory);
    private __poolDirectoryContract: any = null;
    private __initialized = false;
    private __poolRequests: Observer<any>[] = [];

    constructor(
        private __web3: Web3Service,
        private __contractDirectory: ContractDirectoryService
    ) {
        this.PoolDirectoryObject.setProvider(__web3.web3.currentProvider);

        __contractDirectory
            .getAddressFor('TontinePoolDirectory')
            .then((result) => {
                this.__poolDirectoryContract = this.PoolDirectoryObject.at(result);
                this.__initialized = true;
                this.__poolRequests.forEach(obs => obs.next(result));
            });
    }



    getPoolsForUser(userAddress: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            if (!this.__initialized) {
                this.__poolRequests.push(observer);
            }
        });
    }
}