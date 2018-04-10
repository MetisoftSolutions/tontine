import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ContractDirectoryService } from "./contractDirectory.service";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { TontinePoolService } from "./tontinePool.service";
import { Web3Service } from "./web3.service";

@Injectable()
export class ContractService {

  initEventStream: BehaviorSubject<string> = new BehaviorSubject<string>('');



  constructor(
    private __contractDirectoryService: ContractDirectoryService,
    private __poolDirectoryService: TontinePoolDirectoryService,
    private __tontinePoolService: TontinePoolService,
    private __web3Service: Web3Service
  ) {

  }



  init() {
    this.__web3Service.checkAndInstantiateWeb3();

    return this.__contractDirectoryService.init(this.initEventStream)

      .flatMap(() => {
        return this.__poolDirectoryService.init(this.initEventStream);
      })

      .flatMap(() => {
        return this.__tontinePoolService.init(this.initEventStream);
      })

      .subscribe(() => {
        this.initEventStream.next('complete');
      });
  }

}