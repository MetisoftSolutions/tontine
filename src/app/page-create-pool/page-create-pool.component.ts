import { Component, OnInit, NgZone } from '@angular/core';
import { IRouteData } from 'app/app.routes';
import { IPool } from 'models/IPool';
import { TontinePoolService } from 'services/tontinePool.service';
import { LoadingService } from 'services/loading.service';
import { TontinePoolDirectoryService } from 'services/tontinePoolDirectory.service';
import { Web3Service } from 'services/web3.service';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-create-pool',
  templateUrl: './page-create-pool.component.html',
  styleUrls: ['./page-create-pool.component.css']
})
export class PageCreatePoolComponent implements OnInit {

  public static readonly ROUTE_DATA: IRouteData = {
    navbarName: 'Create Pool'
  }

  public pool: IPool;
  public paymentTypes: string[] = [
    'fixed',
    'variable'
  ];
  public submitted = false;



  constructor(
    private __tontinePoolService: TontinePoolService,
    private __poolDirectoryService: TontinePoolDirectoryService,
    private __web3Service: Web3Service,
    private __loadingService: LoadingService,
    private __ngZone: NgZone,
    private __router: Router
  ) {
    this.pool = {
      poolName: '',
      startDate: new Date(Date.now()),
      endDate: new Date(Date.now()),
      paymentType: 'fixed',
      users: []
    };
  }



  ngOnInit() {
  }



  onSubmit() {
    this.__loadingService.turnOn("Deploying pool contract...");
    
    Observable.forkJoin([
        this.__web3Service.getPrimaryAccount().take(1),
        this.__tontinePoolService.createPool(this.pool.poolName, false, 0, true, false).take(1)
      ])

      .mergeMap((retVal: any[]) => {
        let [userAddress, poolInstance] = retVal;
        this.__loadingService.setMessage("Adding pool contract to directory...");
        return this.__poolDirectoryService.addPoolForOwner(poolInstance.address, userAddress);
      })

      .catch((error: any, caught: Observable<any>): any => {
        console.error(error);
      })

      .subscribe(() => {
        this.__loadingService.turnOff();
        this.__ngZone.run(() => {
          this.__router.navigate(['/']);
        });
      });
  }
}