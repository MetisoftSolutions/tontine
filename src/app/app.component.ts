import { Component, HostListener, NgZone, OnInit } from '@angular/core';

import { Web3Service, MetaCoinService } from '../services/services'

import { canBeNumber } from '../util/validation';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  

  constructor(
    private _ngZone: NgZone,
    private web3Service: Web3Service,
    private metaCoinService: MetaCoinService,
  ) {
  }



  ngOnInit(): void {
  }
}
