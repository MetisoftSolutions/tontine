import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'services/loading.service';
import { TontinePoolService, IPoolDetails } from 'services/tontinePool.service';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Web3Service } from 'services/web3.service';

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
        
        this.__loadingService.turnOff();
      });
  }



  triggerPoolDetailsUpdate() {
    return Observable.from(this.__poolService.getDetails(this.poolInstance))

      .subscribe((_poolDetails: IPoolDetails) => {
        this.poolDetails = _poolDetails;
        this.poolDetailsUpdateStream.next(this.poolDetails);
      });
  }

}
