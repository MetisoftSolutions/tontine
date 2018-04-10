import { Component, OnInit } from '@angular/core';
import { IRouteData } from 'app/app.routes';
import { IPool } from 'models/IPool';
import { TontinePoolService } from 'services/tontinePool.service';

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
    private __tontinePoolService: TontinePoolService
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
    this.__tontinePoolService.createPool(false, 0, true, false)
      .subscribe((pool: any) => {
        console.log(pool.address);
        console.log(pool);
      });
  }
}