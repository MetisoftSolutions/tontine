import { Component, OnInit } from '@angular/core';
import { IRouteData } from 'app/app.routes';
import { IPool } from 'models/IPool';

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


  constructor() {
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
    if (this.submitted) return;
    this.submitted = true;
    console.log(this.pool);
  }
}