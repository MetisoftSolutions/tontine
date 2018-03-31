import { Component, OnInit } from '@angular/core';
import { IRouteData } from 'app/app.routes';
import { Web3Service } from 'services/web3.service';
import { ContractDirectoryService } from 'services/contractDirectory.service';
import { TontinePoolDirectoryService } from 'services/tontinePoolDirectory.service';

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.css']
})
export class PageHomeComponent implements OnInit {

  static readonly ROUTE_DATA: IRouteData = {
    navbarName: 'Home'
  }
  constructor(
    private __web3: Web3Service,
    private __cd: TontinePoolDirectoryService
  ) {

    console.log(__cd);
    __web3.checkAndInstantiateWeb3();

    __web3.getAccounts()
      .subscribe(
      (accts: any) => {
        console.log(accts);
      },
      (error: Error) => { 
        console.error(error);
      });
  }

  ngOnInit() {
  }

}
