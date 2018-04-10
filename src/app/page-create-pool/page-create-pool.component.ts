import { Component, OnInit } from '@angular/core';
import { IRouteData } from 'app/app.routes';
import { IPool } from 'models/IPool';
import { TontinePoolService } from 'services/tontinePool.service';
import { LoadingService } from 'services/loading.service';

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
    private __loadingService: LoadingService
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



  onSubmit(pool: IPool) {
    this.__loadingService.turnOn();
    this.__tontinePoolService.createPool(false, 0, true, false)
      .subscribe((pool: any) => {
        this.__loadingService.turnOff();
        console.log(pool.address);
        console.log(pool);
      });
  }
}