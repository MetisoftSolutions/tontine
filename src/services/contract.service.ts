import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ContractDirectoryService } from "./contractDirectory.service";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { TontinePoolService } from "./tontinePool.service";
import { Web3Service } from "./web3.service";
import { PoolListDaemon } from "./poolListDaemon.service";

@Injectable()
export class ContractService {

  initEventStream: BehaviorSubject<string> = new BehaviorSubject<string>('');
  __config: any;



  constructor(
    private __contractDirectoryService: ContractDirectoryService,
    private __poolDirectoryService: TontinePoolDirectoryService,
    private __tontinePoolService: TontinePoolService,
    private __web3Service: Web3Service,
    private __poolListDaemon: PoolListDaemon
  ) {

  }



  init() {
    this.__web3Service.checkAndInstantiateWeb3();

    return this.__web3Service.getNetworkName()

      .flatMap((networkName: string) => {
        this.__config = require(`../../config/${networkName}.config.js`);
        return this.__contractDirectoryService.init(this.initEventStream, this.__config);
      })

      .flatMap(() => {
        return this.__poolDirectoryService.init(this.initEventStream, this.__config);
      })

      .flatMap(() => {
        return this.__tontinePoolService.init(this.initEventStream, this.__config);
      })

      .subscribe(() => {
        this.initEventStream.next('complete');
        this.__poolListDaemon.init();
        this.__poolListDaemon.triggerRefresh.next();
      });
  }

}