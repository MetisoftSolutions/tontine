import { Injectable } from "@angular/core";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { Subject, Observable } from "rxjs";
import { Web3Service } from "./web3.service";
import { TontinePoolService } from "./tontinePool.service";
import * as _ from 'lodash';

export interface IPoolIdentifier {
  name: string;
  address: string
};

@Injectable()
export class PoolListDaemon {

  triggerRefresh: Subject<any>;
  updateEventStream: Subject<any>;

  private __ownedPools: IPoolIdentifier[];
  private __participatingPools: IPoolIdentifier[];



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



  getParticipatingPools() {
    return _.cloneDeep(this.__participatingPools);
  }



  private __refresh() {
    this.__web3Service.getPrimaryAccount()

      .mergeMap((userAddress: string) => {
        return Observable.combineLatest([
          this.__poolDirectoryService.getPoolsForOwner(userAddress),
          this.__poolDirectoryService.getPoolsForParticipant(userAddress)
        ]);
      })

      .mergeMap((poolAddresses: Array<string[]>) => {
        return Observable.combineLatest(_.map(poolAddresses, (poolAddressArray: string[]) => {
          return this.__poolAddresses2PoolIdentifiers(this.__poolService, poolAddressArray);
        }));
      })

      .subscribe((poolIdentifiers: Array<IPoolIdentifier[]>) => {
        let [ownedPools, participatingPools] = poolIdentifiers;

        this.__ownedPools = _.filter(ownedPools, x => x !== null);
        this.__participatingPools = _.filter(participatingPools, x => x !== null);

        this.updateEventStream.next();
      });
  }



  private __poolAddresses2PoolIdentifiers(poolService: TontinePoolService, poolAddresses: string[]): Observable<IPoolIdentifier[]> {
    return Observable.combineLatest(_.map(poolAddresses, (poolAddress: string) => {
      return this.__poolAddress2PoolIdentifier(poolService, poolAddress);
    }));
  }



  private __poolAddress2PoolIdentifier(poolService: TontinePoolService, poolAddress: string): Observable<IPoolIdentifier> {
    if (!poolAddress) {
      return Observable.of(null);
    }

    return Observable.from(poolService.getInstanceFromAddress(poolAddress))

      .mergeMap((poolInstance: any) => {
        return Observable.from(poolInstance.name());
      })

      .mergeMap((poolName: string) => {
        return Observable.of({
          name: poolName,
          address: poolAddress
        });
      });
  }

}