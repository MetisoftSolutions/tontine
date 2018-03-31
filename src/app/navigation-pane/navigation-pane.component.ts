import { Component, OnInit } from '@angular/core';
import { APP_ROUTES, IRouteData } from '../app.routes';
import { Route, Routes } from '@angular/router';


@Component({
  selector: 'app-navigation-pane',
  templateUrl: './navigation-pane.component.html',
  styleUrls: ['./navigation-pane.component.css']
})
export class NavigationPaneComponent implements OnInit {

  public routes: Routes = [];



  constructor() { }


  
  ngOnInit() {
    this.routes = APP_ROUTES.slice(0, APP_ROUTES.length - 1);
  }
}
