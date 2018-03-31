import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { canBeNumber } from '../util/validation';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {


  constructor() {
  }



  ngOnInit(): void {
  }
}
