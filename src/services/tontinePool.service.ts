import { Injectable } from "@angular/core";
import { TontinePoolDirectoryService } from "./tontinePoolDirectory.service";
import { Web3Service } from "./web3.service";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { ContractService } from "./contract.service";
import { InitEventStreamService } from "./initEventStream.service";
import * as _ from 'lodash';

const contract = require('truffle-contract');
const tontinePoolAbi = require('../../build/contracts/TontinePool.json');
const uniqueTokenAbi = require('../../build/contracts/UniqueToken.json');



const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

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

export interface IPaymentsMade {
  [participantAddress: string]: string;
}

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
  paymentsMade: IPaymentsMade;
  pending721Withdrawals: {
    [participantAddress: string]: number;
  };
  
  numTokensMinted: number;
}



@Injectable()
export class TontinePoolService {

  private TontinePool = contract(tontinePoolAbi);
  private UniqueToken = contract(uniqueTokenAbi);

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

        this.UniqueToken.setProvider(this.__web3Service.web3.currentProvider);
        this.UniqueToken.defaults(defaults);

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
        return Observable.from(this.getParticipants(poolInstance));
      })

      .mergeMap((participants: string[]) => {
        return Observable.combineLatest([
          poolInstance.name.call(),
          poolInstance.fixedPaymentAmountWei.call(),
          poolInstance.useErc721.call(),
          poolInstance.useSinglePayment.call(),
          poolInstance.owner.call(),

          poolInstance.state.call(),
          poolInstance.totalWei.call(),
          poolInstance.numParticipantsPaid.call(),

          Observable.of(participants),
          this.getNumTokensMinted(poolInstance),
          this.getPaymentsMade(poolInstance, participants)
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

              participantAddresses,
              numTokensMinted,
              paymentsMade
            ] = retVal,
            stateName,
            stateExternalName;

        stateId = stateId.toNumber();
        stateName = poolStateMap[stateId];
        stateExternalName = poolStateExternalMap[stateId];

        return Observable.of({
          name: name,
          fixedPaymentAmountWei: fixedPaymentAmountWei,
          useErc721: useErc721,
          useSinglePayment: useSinglePayment,
          owner: owner,

          stateId: stateId,
          stateName: stateName,
          stateExternalName: stateExternalName,
          totalWei: totalWei,
          numParticipantsPaid: numParticipantsPaid,

          participantAddresses: participantAddresses,
          paymentsMade: paymentsMade,
          pending721Withdrawals: {},

          numTokensMinted: numTokensMinted
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



  getNumTokensMinted(poolInstance: any): Observable<number> {
    return Observable.from(poolInstance.erc721Master.call())

      .mergeMap((tokenAddress: string) => {
        if (!tokenAddress || tokenAddress === NULL_ADDRESS) {
          return Observable.throw(new Error('NO_ERC_721_MASTER'));
        }

        return Observable.from(this.UniqueToken.at(tokenAddress));
      })

      .mergeMap((tokenInstance: any) => {
        return Observable.from(tokenInstance.totalSupply.call());
      })

      .mergeMap((numTokensMinted: any) => {
        return Observable.of(numTokensMinted.toNumber());
      })

      .catch((err: any, caught: Observable<any>) => {
        if (err.message !== 'NO_ERC_721_MASTER') {
          console.error("Unknown error retrieving ERC 721 master address.");
        }

        return Observable.of(0);
      });
  }



  getPaymentsMade(poolInstance: any, participants: string[]): Observable<IPaymentsMade> {
    if (participants.length === 0) {
      return Observable.of({});
    }

    return Observable.combineLatest(_.map(participants, (participant) => {
        return Observable.from(poolInstance.paymentsMade.call(participant));
      }))

      .map((paymentsWei: any[]) => {
        return _.map(paymentsWei, (paymentWei: any) => {
          return paymentWei.toString();
        });
      })

      .mergeMap((paymentsWei: string[]) => {
        return Observable.of(_.reduce(paymentsWei, (retVal: IPaymentsMade, paymentWei: string, index: number) => {
          let participant = participants[index];
          retVal[participant] = paymentWei;
          return retVal;
        }, {}));
      });
  }



  closeRegistration(poolInstance: any) {
    return Observable.from(poolInstance.closeRegistration());
  }



  transitionToPaymentSubmission(poolInstance: any) {
    return Observable.from(poolInstance.transitionToPaymentSubmission());
  }



  mintSubsetOfTokens(poolInstance: any) {
    return Observable.from(poolInstance.mintSubsetOfTokens());
  }



  makePayment(poolInstance: any, paymentAmountWei: string) {
    return Observable.from(poolInstance.makePayment({
      value: paymentAmountWei
    }));
  }

}