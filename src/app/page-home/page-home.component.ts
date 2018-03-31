import { Component, OnInit } from '@angular/core';
import { IRouteData } from 'app/app.routes';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.css']
})
export class PageHomeComponent implements OnInit {

  static readonly ROUTE_DATA: IRouteData = {
    navbarName: 'Home'
  }
  constructor() { }

  ngOnInit() {
  }

}
