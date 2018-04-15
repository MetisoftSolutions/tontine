import { Component, OnInit } from '@angular/core';
import { APP_ROUTES, IRouteData } from '../app.routes';
import { Route, Routes } from '@angular/router';
import { Web3Service } from 'services/web3.service';
import { ModalService } from 'services/modal.service';


@Component({
  selector: 'app-navigation-pane',
  templateUrl: './navigation-pane.component.html',
  styleUrls: ['./navigation-pane.component.css']
})
export class NavigationPaneComponent implements OnInit {

  public routes: Routes = [];
  isLocalMode = false;
  isSwitchAccountWidgetVisible = false;



  constructor(
    private __web3Service: Web3Service,
    private __modalService: ModalService
  ) { }


  
  ngOnInit() {
    this.routes = APP_ROUTES.slice(0, APP_ROUTES.length - 1);

    this.__web3Service.getNetworkName()
      .subscribe((networkName: string) => {
        this.isLocalMode = (networkName === 'local');
      });
  }



  onClickSwitchAccounts() {
    this.__modalService.turnOnSwitchAccountModal();
  }

}
