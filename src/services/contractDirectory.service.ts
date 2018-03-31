import { Injectable } from "@angular/core";
import { Web3Service } from "services/web3.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

const contract = require('truffle-contract');
const contractDirectory = require('../../build/contracts/TontineContractDirectory.json');


@Injectable()
export class ContractDirectoryService {

    private ContractDirectory = contract(contractDirectory);

    private __contractDirectory: any;
    constructor(
        private __web3Service: Web3Service
    ) {
        this.ContractDirectory.setProvider(__web3Service.web3.currentProvider);
        this.__contractDirectory = this.ContractDirectory.at('0x0c30702336c4832c91a4da1ec1df5573d4a70e3b');
    }



    getAddressFor(contractName: string) {
        return this.__contractDirectory.contractName2Address(contractName);
    }
}