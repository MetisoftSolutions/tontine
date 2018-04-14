import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'services/loading.service';
import { TontinePoolService, IPoolDetails } from 'services/tontinePool.service';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-page-pool-details',
  templateUrl: './page-pool-details.component.html',
  styleUrls: ['./page-pool-details.component.css']
})
export class PagePoolDetailsComponent implements OnInit {

  address: string;
  poolInstance: any;
  poolDetails: IPoolDetails = null;



  constructor(
    private __activatedRoute: ActivatedRoute,
    private __loadingService: LoadingService,
    private __poolService: TontinePoolService
  ) { }



  ngOnInit() {
    this.__loadingService.turnOn("Loading pool from address...");

    this.__activatedRoute.params

      .mergeMap((params: any) => {
        this.address = params.address;
        return this.__poolService.getInstanceFromAddress(this.address);
      })

      .mergeMap((_poolInstance: any) => {
        this.poolInstance = _poolInstance;
        this.__loadingService.setMessage("Loading details from pool...");
        return this.__loadPoolDetails();
      })

      .subscribe((_poolDetails: IPoolDetails) => {
        this.poolDetails = _poolDetails;
        this.__loadingService.turnOff();
      });
  }



  private __loadPoolDetails() {
    return this.__poolService.getDetails(this.poolInstance);
  }

}
