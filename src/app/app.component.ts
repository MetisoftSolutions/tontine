import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { canBeNumber } from '../util/validation';
import { ContractDirectoryService } from 'services/contractDirectory.service';
import { TontinePoolDirectoryService } from 'services/tontinePoolDirectory.service';
import { Promise } from 'bluebird';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ContractService } from 'services/contract.service';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(
    private __contractService: ContractService
  ) {

  }



  ngOnInit(): void {
    this.__contractService.init();
  }

}
