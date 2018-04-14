import { Injectable } from "@angular/core";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { Web3Service } from "./web3.service";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { ContractService } from "./contract.service";
import { InitEventStreamService } from "./initEventStream.service";
import * as _ from 'lodash';

const contract = require('truffle-contract');
const tontinePoolAbi = require('../../build/contracts/TontinePool.json');



const poolStateMap = {
  '0': 'registration',
  '1': 'mintingTokens',
  '2': 'paymentSubmission',
  '3': 'calcWithdrawalTokens',
  '4': 'distribution'
};

const poolStateExternalMap = {
  '0': "Registration",
  '1': "Minting tokens",
  '2': "Payment submission",
  '3': "Calculating withdrawal tokens",
  '4': "Distribution"
};

export interface IPoolDetails {
  name: string;
  fixedPaymentAmountWei: string; // string in case the numbers from the contract are very large
  useErc721: boolean;
  useSinglePayment: boolean;
  owner: string;

  stateId: number;
  stateName: string; // from poolStateMap
  stateExternalName: string; // from poolStateExternalMap
  totalWei: string;
  numParticipantsPaid: number;

  participantAddresses: string[];
  paymentsMade: {
    [participantAddress: string]: string;
  };
  pending721Withdrawals: {
    [participantAddress: string]: number;
  };
}



@Injectable()
export class TontinePoolService {

  private TontinePool = contract(tontinePoolAbi);

  constructor(
    private __web3Service: Web3Service,
    private __poolDirectoryService: TontinePoolDirectoryService,
    private __initEventStreamService: InitEventStreamService
  ) {

  }



  init(config: any): Observable<boolean> {
    return this.__web3Service.getPrimaryAccount()

      .flatMap((account: string): Observable<boolean> => {
        let gas = config.gas,
            defaults: any = {
              from: account
            };

        if (gas) {
          defaults.gas = gas;
        }

        this.TontinePool.setProvider(this.__web3Service.web3.currentProvider);
        this.TontinePool.defaults(defaults);

        return Observable.of(true);
      })

      .catch((error: any, caught: Observable<any>): any => {
        console.error(error);
        return Observable.of(false);
      });
  }



  createPool(name: string, useRandomOrdering: boolean, fixedPaymentAmountWei: number, useErc721: boolean, useSinglePayment: boolean) {
    return this.__initEventStreamService.stream

      .mergeMap((status: string) => {
        return Observable.from(
          this.TontinePool.new(
            name,
            useRandomOrdering,
            fixedPaymentAmountWei,
            useErc721,
            useSinglePayment
          )
        );
      });
  }



  getInstanceFromAddress(poolAddress: string) {
    return this.__initEventStreamService.stream

      .mergeMap((status: string) => {
        return Observable.from(this.TontinePool.at(poolAddress));
      });
  }



  getDetails(poolInstance: any): Observable<IPoolDetails> {
    return this.__initEventStreamService.stream

      .mergeMap(() => {
        return Observable.combineLatest([
          poolInstance.name.call(),
          poolInstance.fixedPaymentAmountWei.call(),
          poolInstance.useErc721.call(),
          poolInstance.useSinglePayment.call(),
          poolInstance.owner.call(),

          poolInstance.state.call(),
          poolInstance.totalWei.call(),
          poolInstance.numParticipantsPaid.call(),

          this.getParticipants(poolInstance)
        ]);
      })

      .mergeMap((retVal: any[]): Observable<IPoolDetails> => {
        let [
              name,
              fixedPaymentAmountWei,
              useErc721,
              useSinglePayment,
              owner,

              stateId,
              totalWei,
              numParticipantsPaid,

              participantAddresses
            ] = retVal,
            stateName,
            stateExternalName;

        stateId = stateId.toNumber();
        stateName = poolStateMap[stateId];
        stateExternalName = poolStateExternalMap[stateId];

        return Observable.of({
          name: name,
          fixedPaymentAmountWei: fixedPaymentAmountWei,
          useErc721: false,
          useSinglePayment: false,
          owner: owner,

          stateId: stateId,
          stateName: stateName,
          stateExternalName: stateExternalName,
          totalWei: totalWei,
          numParticipantsPaid: numParticipantsPaid,

          participantAddresses: participantAddresses,
          paymentsMade: {},
          pending721Withdrawals: {}
        });
      });
  }



  getParticipants(poolInstance: any): Observable<string[]> {
    return Observable.from(poolInstance.getNumberOfParticipants())

      .map((numberOfParticipants: any) => numberOfParticipants.toNumber())

      .mergeMap((numberOfParticipants: number) => {
        if (numberOfParticipants === 0) {
          return Observable.of([]);
        }
        
        return Observable.combineLatest(_.map(_.range(numberOfParticipants), (index) => {
          return Observable.from(poolInstance.participants.call(index));
        }));
      })
  }



  closeRegistration(poolInstance: any) {
    return Observable.from(poolInstance.closeRegistration());
  }

}