import { Injectable } from "@angular/core";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { Subject, Observable } from "rxjs";
import { Web3Service } from "./web3.service";
import { TontinePoolService } from "./tontinePool.service";
import * as _ from 'lodash';

@Injectable()
export class PoolListDaemon {

  triggerRefresh: Subject<any>;
  updateEventStream: Subject<any>;

  private __ownedPools: {
        name: string,
        address: string
      }[];



  constructor(
    private __web3Service: Web3Service,
    private __poolDirectoryService: TontinePoolDirectoryService,
    private __poolService: TontinePoolService
  ) {
    this.triggerRefresh = new Subject<any>();
    this.updateEventStream = new Subject<any>();
  }



  init() {
    this.triggerRefresh.subscribe(() => {
      this.__refresh();
    });
  }



  getOwnedPools() {
    return _.cloneDeep(this.__ownedPools);
  }



  private __refresh() {
    let poolAddresses;

    this.__web3Service.getPrimaryAccount()

      .mergeMap((userAddress: string) => {
        return Observable.from(this.__poolDirectoryService.getPoolsForOwner(userAddress));
      })

      .mergeMap((_poolAddresses: string[]) => {
        poolAddresses = _poolAddresses;
        return Observable.forkJoin(_.map(poolAddresses, (poolAddress: string) => {
            return Observable.from(this.__poolService.getInstanceFromAddress(poolAddress));
          }));
      })

      .mergeMap((poolInstances: any[]) => {
        return Observable.forkJoin(_.map(poolInstances, (poolInstance: any) => {
            return Observable.from(poolInstance.name());
          }));
      })

      .subscribe((poolNames: string[]) => {
        this.__ownedPools = _.map(poolAddresses, (poolAddress, index) => {
            return {
              address: poolAddress,
              name: poolNames[index]
            };
          });

        this.updateEventStream.next();
      });
  }

}