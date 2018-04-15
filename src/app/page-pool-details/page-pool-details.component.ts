import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'services/loading.service';
import { TontinePoolService, IPoolDetails } from 'services/tontinePool.service';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Web3Service } from 'services/web3.service';
import * as _ from 'lodash';
import * as BigNumber from 'bignumber.js';

@Component({
  selector: 'app-page-pool-details',
  templateUrl: './page-pool-details.component.html',
  styleUrls: ['./page-pool-details.component.css']
})
export class PagePoolDetailsComponent implements OnInit {

  address: string;
  poolInstance: any;
  poolDetails: IPoolDetails = null;
  poolDetailsUpdateStream: ReplaySubject<IPoolDetails> = new ReplaySubject<IPoolDetails>(1);
  isOwner: boolean = false;
  isParticipant: boolean = false;

  paymentsMade: [{
    shortenedParticipant: string,
    paymentMadeWei: string
  }];
  pending721Withdrawals: [{
    shortenedParticipant: string,
    pending721Amount: number
  }];
  
  stateChangeEvent: any;
  mintingStatusEvent: any;



  constructor(
    private __activatedRoute: ActivatedRoute,
    private __loadingService: LoadingService,
    private __poolService: TontinePoolService,
    private __web3Service: Web3Service
  ) { }



  ngOnInit() {
    this.triggerPoolDetailsUpdate = this.triggerPoolDetailsUpdate.bind(this);
    
    this.__loadingService.turnOn("Loading pool from address...");

    this.__activatedRoute.params

      .mergeMap((params: any) => {
        this.address = params.address;
        return this.__poolService.getInstanceFromAddress(this.address);
      })

      .mergeMap((_poolInstance: any) => {
        this.poolInstance = _poolInstance;
        this.__setUpEventHandlers(this.poolInstance);

        this.__loadingService.setMessage("Loading details from pool...");

        this.triggerPoolDetailsUpdate();

        return Observable.combineLatest([
          this.poolDetailsUpdateStream,
          this.__web3Service.getPrimaryAccount()
        ]);
      })

      .subscribe((retVal: [IPoolDetails, string]) => {
        let account = retVal[1];
        this.poolDetails = retVal[0];

        if (this.poolDetails.owner === account) {
          this.isOwner = true;
        }

        if (this.poolDetails.participantAddresses.indexOf(account) !== -1) {
          this.isParticipant = true;
        }
        
        this.__loadingService.turnOff();
      });
  }



  private __setUpEventHandlers(poolInstance: any) {
    this.stateChangeEvent = poolInstance.StateChange();
    this.stateChangeEvent.watch(this.__onStateChanged.bind(this));

    this.mintingStatusEvent = poolInstance.MintingStatus();
    this.mintingStatusEvent.watch(this.__onMintingStatusChanged.bind(this));
  }



  private __onStateChanged(error, event) {
    if (!error) {
      this.triggerPoolDetailsUpdate();
    }
  }



  private __onMintingStatusChanged(error, event) {
    if (!error) {
      if (!event.args.isComplete) {
        this.__poolService.mintSubsetOfTokens(this.poolInstance);
      }
    }
  }



  triggerPoolDetailsUpdate() {
    return Observable.from(this.__poolService.getDetails(this.poolInstance))

      .subscribe((_poolDetails: IPoolDetails) => {
        this.poolDetails = _poolDetails;
        this.__processPoolDetails(this.poolDetails);
        this.poolDetailsUpdateStream.next(this.poolDetails);
      });
  }



  private __processPoolDetails(poolDetails: IPoolDetails) {
    this.paymentsMade = _.map(poolDetails.paymentsMade, (paymentMadeWei: string, participantAddress: string) => {
      return {
        paymentMadeWei: paymentMadeWei,
        shortenedParticipant: this.__shortenAddress(participantAddress)
      };
    });

    this.pending721Withdrawals = _.map(poolDetails.pending721Withdrawals, (pending721Amount: number, participantAddress: string) => {
      return {
        pending721Amount: pending721Amount,
        shortenedParticipant: this.__shortenAddress(participantAddress)
      };
    });
  }



  private __shortenAddress(address: string) {
    return address.slice(0, 10) + '...';
  }



  onClickCloseRegistration() {
    return Observable.from(this.__poolService.closeRegistration(this.poolInstance))
      .subscribe(() => {
        this.triggerPoolDetailsUpdate();
      });
  }



  onClickMintTokens() {
    return Observable.from(this.__poolService.mintSubsetOfTokens(this.poolInstance))
      .subscribe(() => {
        this.triggerPoolDetailsUpdate();
      });
  }



  onClickTransitionToPaymentSubmission() {
    return Observable.from(this.__poolService.transitionToPaymentSubmission(this.poolInstance))
      .subscribe(() => {
        this.triggerPoolDetailsUpdate();
      });
  }



  onClickMakePayment(paymentAmountWei: string) {
    return Observable.from(this.__poolService.makePayment(this.poolInstance, paymentAmountWei))
      .subscribe(
        () => {
          this.triggerPoolDetailsUpdate();
        },
        (err: any) => {
          console.error(err);
        });
  }

}
