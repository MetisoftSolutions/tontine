import { Injectable } from "@angular/core";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { Web3Service } from "./web3.service";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { ContractService } from "./contract.service";

const contract = require('truffle-contract');
const tontinePoolAbi = require('../../build/contracts/TontinePool.json');



@Injectable()
export class TontinePoolService {

  private TontinePool = contract(tontinePoolAbi);
  private __initEventStream: BehaviorSubject<string>;

  constructor(
    private __web3Service: Web3Service,
    private __poolDirectoryService: TontinePoolDirectoryService
  ) {

  }



  init(initEventStream: BehaviorSubject<string>): Observable<boolean> {
    this.__initEventStream = initEventStream;

    return this.__web3Service.getPrimaryAccount()

      .flatMap((account: string): Observable<boolean> => {
        this.TontinePool.setProvider(this.__web3Service.web3.currentProvider);
        this.TontinePool.defaults({from: account});

        return Observable.of(true);
      });
  }



  createPool(useRandomOrdering: boolean, fixedPaymentAmountWei: number, useErc721: boolean, useSinglePayment: boolean) {
    return this.__initEventStream

      .mergeMap((status: string) => {
        if (status) {
          return Observable.from(
            this.TontinePool.new(
              useRandomOrdering,
              fixedPaymentAmountWei,
              useErc721,
              useSinglePayment
            )
          );
        }
      });  
  }

}